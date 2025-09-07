import type { FastifyRequest, FastifyReply } from 'fastify';
import { analytics } from '../manager';
import { get_encoding } from "tiktoken";

const enc = get_encoding("cl100k_base");

interface TrackedRequest extends FastifyRequest {
  startTime?: number;
  modelInfo?: {
    model: string;
    provider: string;
  };
  selectedProvider?: string;
  routeUsed?: string;
  inputTokens?: number;
  outputTokens?: number;
  tokenCount?: number;
}

// Helper to extract model info from request
function extractModelInfo(request: FastifyRequest): { model: string; provider: string } {
  const body = request.body as any;
  
  // Check if it's a chat completion request
  if (body?.model) {
    return {
      model: body.model,
      provider: 'unknown' // Will be determined by routing logic
    };
  }

  // Default fallback
  return {
    model: 'unknown',
    provider: 'unknown'
  };
}

// Helper to estimate token count using tiktoken
function calculateTokenCountFromText(text: string): number {
  return enc.encode(text).length;
}

// Token calculation function (copied from router.ts for consistency)
const calculateTokenCount = (
  messages: any[],
  system: any,
  tools: any[] = []
) => {
  let tokenCount = 0;
  if (Array.isArray(messages)) {
    messages.forEach((message) => {
      if (typeof message.content === "string") {
        tokenCount += enc.encode(message.content).length;
      } else if (Array.isArray(message.content)) {
        message.content.forEach((contentPart: any) => {
          if (contentPart.type === "text") {
            tokenCount += enc.encode(contentPart.text).length;
          } else if (contentPart.type === "tool_use") {
            tokenCount += enc.encode(JSON.stringify(contentPart.input)).length;
          } else if (contentPart.type === "tool_result") {
            tokenCount += enc.encode(
              typeof contentPart.content === "string"
                ? contentPart.content
                : JSON.stringify(contentPart.content)
            ).length;
          }
        });
      }
    });
  }
  if (typeof system === "string") {
    tokenCount += enc.encode(system).length;
  } else if (Array.isArray(system)) {
    system.forEach((item: any) => {
      if (item.type !== "text") return;
      if (typeof item.text === "string") {
        tokenCount += enc.encode(item.text).length;
      }
    });
  }
  if (tools) {
    tools.forEach((tool: any) => {
      if (tool.description) {
        tokenCount += enc.encode(tool.name + tool.description).length;
      }
      if (tool.input_schema) {
        tokenCount += enc.encode(JSON.stringify(tool.input_schema)).length;
      }
    });
  }
  return tokenCount;
};

// Helper to extract token info from response
function extractTokenInfo(request: FastifyRequest, response: any) {
  const body = request.body as any;
  
  let inputTokens = 0;
  let outputTokens = 0;

  // Priority 1: Calculate input tokens using the same method as router.ts
  if (body?.messages && Array.isArray(body.messages)) {
    try {
      inputTokens = calculateTokenCount(body.messages as any[], body.system, body.tools);
    } catch (error) {
      console.warn('Error calculating input tokens, falling back to estimation:', error);
      // Fallback estimation
      const inputText = body.messages.map((m: any) => m.content || '').join(' ');
      inputTokens = calculateTokenCountFromText(inputText);
    }
  }

  // Priority 2: Extract output tokens from response
  if (response?.choices && Array.isArray(response.choices)) {
    const outputText = response.choices.map((c: any) => 
      c.message?.content || c.text || ''
    ).join(' ');
    outputTokens = calculateTokenCountFromText(outputText);
  }

  // Priority 3: Use exact usage info from response if available
  if (response?.usage) {
    inputTokens = response.usage.prompt_tokens || inputTokens;
    outputTokens = response.usage.completion_tokens || outputTokens;
  }

  // Handle streaming responses with usage info
  if (response?.usage && typeof response.usage === 'object') {
    inputTokens = response.usage.input_tokens || response.usage.prompt_tokens || inputTokens;
    outputTokens = response.usage.output_tokens || response.usage.completion_tokens || outputTokens;
  }

  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens
  };
}

// Middleware to track request start
export function trackingStartMiddleware(request: TrackedRequest, reply: FastifyReply, done: any) {
  // Only track API requests to AI endpoints
  if (!request.url.includes('/v1/') && !request.url.includes('/api/')) {
    return done();
  }

  request.startTime = Date.now();
  request.modelInfo = extractModelInfo(request);
  
  done();
}

// Middleware to track request completion
export function trackingEndMiddleware(request: TrackedRequest, reply: FastifyReply, payload: any, done: any) {
  // Only track if we have start time
  if (!request.startTime) {
    return done(null, payload);
  }

  const endTime = Date.now();
  const responseTime = endTime - request.startTime;

  try {
    // Parse response if it's JSON
    let responseData = payload;
    if (typeof payload === 'string') {
      try {
        responseData = JSON.parse(payload);
      } catch (e) {
        // Not JSON, use as is
      }
    }

    // Extract token information
    const tokenInfo = extractTokenInfo(request, responseData);

    // Set token information on request object for access in onResponse hook and other tracking
    (request as any).inputTokens = tokenInfo.inputTokens;
    (request as any).outputTokens = tokenInfo.outputTokens;
    (request as any).tokenCount = tokenInfo.totalTokens;

    // **SOLUTION: Auto-detect actual model and provider from router output**
    // The router sets req.body.model to the final resolved model (e.g., "openrouter,gpt-4o")
    // This is our source of truth for what was actually used
    const routerModel = (request.body as any)?.model || 'unknown';
    const originalModel = request.modelInfo?.model || 'unknown';

    let modelInfo = { model: 'unknown', provider: 'unknown' };
    let routeUsed = 'default';

    // Extract real provider and model from router output
    if (routerModel.includes(',')) {
      // Format: "provider,model" (e.g., "openrouter,gpt-4o")
      const [provider, model] = routerModel.split(',');
      modelInfo = { model, provider };
      
      // Auto-detect route used based on model characteristics
      routeUsed = detectRouteUsed(request, routerModel, originalModel);
    } else {
      // Single model name - try to determine provider
      modelInfo = {
        model: routerModel,
        provider: detectProviderFromModel(routerModel)
      };
      routeUsed = detectRouteUsed(request, routerModel, originalModel);
    }

    // Fallback: Use legacy detection methods if auto-detection fails
    if (modelInfo.model === 'unknown' || modelInfo.provider === 'unknown') {
      // Use the actual model from routing if available (legacy support)
      if ((request as any).actualModel) {
        modelInfo = {
          model: (request as any).actualModel,
          provider: (request as any).selectedProvider || modelInfo.provider
        };
      } 
      // Fallback to response model if available
      else if (responseData?.model) {
        modelInfo = {
          model: responseData.model,
          provider: (request as any).selectedProvider || detectProviderFromModel(responseData.model)
        };
      }
      // Fallback to original request model
      else if (request.modelInfo) {
        modelInfo = request.modelInfo;
      }
    }

    // Ensure routeUsed is set
    if (request.routeUsed) {
      routeUsed = request.routeUsed;
    }

    // Track the request with enhanced token tracking for all routes
    analytics.trackRequest({
      model: modelInfo.model,
      provider: modelInfo.provider,
      endpoint: request.url,
      method: request.method,
      statusCode: reply.statusCode,
      responseTime,
      tokenCount: tokenInfo.totalTokens,
      inputTokens: tokenInfo.inputTokens,
      outputTokens: tokenInfo.outputTokens,
      cost: estimateCost(modelInfo.model, tokenInfo),
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
      error: reply.statusCode >= 400 ? getErrorMessage(responseData) : undefined,
      route: routeUsed,
      originalModel: originalModel,
      actualModel: modelInfo.model
    });

  } catch (error) {
    console.error('Error tracking request:', error);
  }

  done(null, payload);
}

// **NEW: Auto-detection functions for complete plugin independence**

// Helper to detect provider from model name
function detectProviderFromModel(model: string): string {
  if (!model || model === 'unknown') return 'unknown';
  
  // Check common provider patterns
  if (model.includes('claude')) return 'anthropic';
  if (model.includes('gpt-') || model.includes('openai')) return 'openai';
  if (model.includes('gemini')) return 'google';
  if (model.includes('llama')) return 'meta';
  if (model.includes('mistral')) return 'mistral';
  if (model.includes('deepseek')) return 'deepseek';
  
  // Default fallback
  return 'unknown';
}

// Helper to detect which route was used based on request characteristics
function detectRouteUsed(request: any, finalModel: string, originalModel: string): string {
  const body = request.body || {};
  
  // Check for specific route indicators
  if (body.thinking) return 'think';
  if (Array.isArray(body.tools) && body.tools.some((tool: any) => tool.type?.startsWith('web_search'))) {
    return 'webSearch';
  }
  if (originalModel?.includes('haiku')) return 'background';
  
  // Check for long context usage (if final model different from default)
  const tokenCount = (request as any).tokenCount;
  if (tokenCount && tokenCount > 60000) return 'longContext';
  
  // Check for subagent model usage
  if (Array.isArray(body.system)) {
    const hasSubagent = body.system.some((item: any) => 
      item.text && item.text.includes('<CCR-SUBAGENT-MODEL>')
    );
    if (hasSubagent) return 'subagent';
  }
  
  // If model was explicitly specified with provider (e.g., "openrouter,gpt-4")
  if (originalModel !== finalModel && finalModel.includes(',')) {
    return 'custom';
  }
  
  return 'default';
}

// Helper to determine provider based on routing (legacy support)
function determineProvider(request: TrackedRequest, _response: any): string {
    // The provider is now determined by the router and added to the request object
    // Use the value from request.selectedProvider if available
    const provider = request.selectedProvider || 'unknown';

    return provider;
  }

// Helper to estimate cost (rough estimation)
function estimateCost(model: string, tokenInfo: { inputTokens: number; outputTokens: number }): number {
  // Rough cost estimation based on known pricing (as of 2024)
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 0.03 / 1000, output: 0.06 / 1000 },
    'gpt-3.5-turbo': { input: 0.0015 / 1000, output: 0.002 / 1000 },
    'claude-3-opus': { input: 0.015 / 1000, output: 0.075 / 1000 },
    'claude-3-sonnet': { input: 0.003 / 1000, output: 0.015 / 1000 },
    'claude-3-haiku': { input: 0.00025 / 1000, output: 0.00125 / 1000 },
    'claude-3-5-sonnet': { input: 0.003 / 1000, output: 0.015 / 1000 }
  };

  const modelPricing = pricing[model] || { input: 0.001 / 1000, output: 0.002 / 1000 };
  
  return (tokenInfo.inputTokens * modelPricing.input) + (tokenInfo.outputTokens * modelPricing.output);
}

// Helper to extract error message
function getErrorMessage(response: any): string {
  if (typeof response === 'object') {
    return response.error?.message || response.message || 'Unknown error';
  }
  return 'Unknown error';
}
