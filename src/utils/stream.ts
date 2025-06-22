import { Request, Response } from "express";
import { log } from "./log";
import { PLUGINS } from "../middlewares/plugin";
import { sha256 } from ".";

declare module "express" {
  interface Request {
    provider?: string;
  }
}

interface ContentBlock {
  type: string;
  id?: string;
  name?: string;
  input?: any;
  text?: string;
}

interface MessageEvent {
  type: string;
  message?: {
    id: string;
    type: string;
    role: string;
    content: any[];
    model: string;
    stop_reason: string | null;
    stop_sequence: string | null;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  };
  delta?: {
    stop_reason?: string;
    stop_sequence?: string | null;
    content?: ContentBlock[];
    type?: string;
    text?: string;
    partial_json?: string;
  };
  index?: number;
  content_block?: ContentBlock;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export async function streamOpenAIResponse(
  req: Request,
  res: Response,
  _completion: any
) {
  let completion = _completion;
  res.locals.completion = completion;

  for (const [name, plugin] of PLUGINS.entries()) {
    if (name.includes(",") && !name.startsWith(`${req.provider},`)) {
      continue;
    }
    if (plugin.beforeTransformResponse) {
      const result = await plugin.beforeTransformResponse(req, res, {
        completion,
      });
      if (result) {
        completion = result;
      }
    }
  }
  const write = async (data: string) => {
    let eventData = data;
    for (const [name, plugin] of PLUGINS.entries()) {
      if (name.includes(",") && !name.startsWith(`${req.provider},`)) {
        continue;
      }
      if (plugin.afterTransformResponse) {
        const hookResult = await plugin.afterTransformResponse(req, res, {
          completion: res.locals.completion,
          transformedCompletion: eventData,
        });
        if (typeof hookResult === "string") {
          eventData = hookResult;
        }
      }
    }
    if (eventData) {
      log("response: ", eventData);
      res.write(eventData);
    }
  };
  const messageId = "msg_" + Date.now();
  if (!req.body.stream) {
    let content: any = [];
    if (completion.choices[0].message.content) {
      content = [{ text: completion.choices[0].message.content, type: "text" }];
    } else if (completion.choices[0].message.tool_calls) {
      content = completion.choices[0].message.tool_calls.map((item: any) => {
        return {
          type: "tool_use",
          id: item.id,
          name: item.function?.name,
          input: item.function?.arguments
            ? JSON.parse(item.function.arguments)
            : {},
        };
      });
    }

    const result = {
      id: messageId,
      type: "message",
      role: "assistant",
      // @ts-ignore
      content: content,
      stop_reason:
        completion.choices[0].finish_reason === "tool_calls"
          ? "tool_use"
          : "end_turn",
      stop_sequence: null,
    };
    try {
      res.locals.transformedCompletion = result;
      for (const [name, plugin] of PLUGINS.entries()) {
        if (name.includes(",") && !name.startsWith(`${req.provider},`)) {
          continue;
        }
        if (plugin.afterTransformResponse) {
          const hookResult = await plugin.afterTransformResponse(req, res, {
            completion: res.locals.completion,
            transformedCompletion: res.locals.transformedCompletion,
          });
          if (hookResult) {
            res.locals.transformedCompletion = hookResult;
          }
        }
      }
      res.json(res.locals.transformedCompletion);
      res.end();
      return;
    } catch (error) {
      log("Error sending response:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  let contentBlockIndex = 0;
  let currentContentBlocks: ContentBlock[] = [];

  // Send message_start event
  const messageStart: MessageEvent = {
    type: "message_start",
    message: {
      id: messageId,
      type: "message",
      role: "assistant",
      content: [],
      model: req.body.model,
      stop_reason: null,
      stop_sequence: null,
      usage: { input_tokens: 1, output_tokens: 1 },
    },
  };
  write(`event: message_start\ndata: ${JSON.stringify(messageStart)}\n\n`);

  let isToolUse = false;
  let toolUseJson = "";
  let hasStartedTextBlock = false;
  let currentToolCallId: string | null = null;
  let toolCallJsonMap = new Map<string, string>();

  try {
    for await (const chunk of completion) {
      log("Processing chunk:", chunk);
      const delta = chunk.choices[0].delta;

      if (delta.tool_calls && delta.tool_calls.length > 0) {
        // Handle each tool call in the current chunk
        for (const [index, toolCall] of delta.tool_calls.entries()) {
          // Generate a stable ID for this tool call position
          const toolCallId = toolCall.id || `tool_${index}`;

          // If this position doesn't have an active tool call, start a new one
          if (!toolCallJsonMap.has(`${index}`)) {
            // End previous tool call if one was active
            if (isToolUse && currentToolCallId) {
              const contentBlockStop: MessageEvent = {
                type: "content_block_stop",
                index: contentBlockIndex,
              };
              write(
                `event: content_block_stop\ndata: ${JSON.stringify(
                  contentBlockStop
                )}\n\n`
              );
            }

            // Start new tool call block
            isToolUse = true;
            currentToolCallId = `${index}`;
            contentBlockIndex++;
            toolCallJsonMap.set(`${index}`, ""); // Initialize JSON accumulator for this tool call

            const toolBlock: ContentBlock = {
              type: "tool_use",
              id: toolCallId, // Use the original ID if available
              name: toolCall.function?.name,
              input: {},
            };

            const toolBlockStart: MessageEvent = {
              type: "content_block_start",
              index: contentBlockIndex,
              content_block: toolBlock,
            };

            currentContentBlocks.push(toolBlock);

            write(
              `event: content_block_start\ndata: ${JSON.stringify(
                toolBlockStart
              )}\n\n`
            );
          }

          // Stream tool call JSON for this position
          if (toolCall.function?.arguments) {
            const jsonDelta: MessageEvent = {
              type: "content_block_delta",
              index: contentBlockIndex,
              delta: {
                type: "input_json_delta",
                partial_json: toolCall.function.arguments,
              },
            };

            // Accumulate JSON for this specific tool call position
            const currentJson = toolCallJsonMap.get(`${index}`) || "";
            const newJson = currentJson + toolCall.function.arguments;
            toolCallJsonMap.set(`${index}`, newJson);

            // Try to parse accumulated JSON
            if (isValidJson(newJson)) {
              try {
                const parsedJson = JSON.parse(newJson);
                const blockIndex = currentContentBlocks.findIndex(
                  (block) => block.type === "tool_use" && block.id === toolCallId
                );
                if (blockIndex !== -1) {
                  currentContentBlocks[blockIndex].input = parsedJson;
                }
              } catch (e) {
                log("JSON parsing error (continuing to accumulate):", e);
              }
            }

            write(
              `event: content_block_delta\ndata: ${JSON.stringify(
                jsonDelta
              )}\n\n`
            );
          }
        }
      } else if (delta.content || chunk.choices[0].finish_reason) {
        // Handle regular text content or completion
        if (
          isToolUse &&
          (delta.content || chunk.choices[0].finish_reason === "tool_calls")
        ) {
          log("Tool call ended here:", delta);
          // End previous tool call block
          const contentBlockStop: MessageEvent = {
            type: "content_block_stop",
            index: contentBlockIndex,
          };

          write(
            `event: content_block_stop\ndata: ${JSON.stringify(
              contentBlockStop
            )}\n\n`
          );
          contentBlockIndex++;
          isToolUse = false;
          currentToolCallId = null;
          toolUseJson = ""; // Reset for safety
        }

        // If text block not yet started, send content_block_start
        if (!hasStartedTextBlock) {
          const textBlock: ContentBlock = {
            type: "text",
            text: "",
          };

          const textBlockStart: MessageEvent = {
            type: "content_block_start",
            index: contentBlockIndex,
            content_block: textBlock,
          };

          currentContentBlocks.push(textBlock);

          write(
            `event: content_block_start\ndata: ${JSON.stringify(
              textBlockStart
            )}\n\n`
          );
          hasStartedTextBlock = true;
        }

        // Send regular text content
        const contentDelta: MessageEvent = {
          type: "content_block_delta",
          index: contentBlockIndex,
          delta: {
            type: "text_delta",
            text: delta.content,
          },
        };

        // Update content block text
        if (currentContentBlocks[contentBlockIndex]) {
          currentContentBlocks[contentBlockIndex].text += delta.content;
        }

        write(
          `event: content_block_delta\ndata: ${JSON.stringify(
            contentDelta
          )}\n\n`
        );
      }
    }
  } catch (e: any) {
    // If text block not yet started, send content_block_start
    if (!hasStartedTextBlock) {
      const textBlock: ContentBlock = {
        type: "text",
        text: "",
      };

      const textBlockStart: MessageEvent = {
        type: "content_block_start",
        index: contentBlockIndex,
        content_block: textBlock,
      };

      currentContentBlocks.push(textBlock);

      write(
        `event: content_block_start\ndata: ${JSON.stringify(
          textBlockStart
        )}\n\n`
      );
      hasStartedTextBlock = true;
    }

    // Send regular text content
    const contentDelta: MessageEvent = {
      type: "content_block_delta",
      index: contentBlockIndex,
      delta: {
        type: "text_delta",
        text: JSON.stringify(e),
      },
    };

    // Update content block text
    if (currentContentBlocks[contentBlockIndex]) {
      currentContentBlocks[contentBlockIndex].text += JSON.stringify(e);
    }

    write(
      `event: content_block_delta\ndata: ${JSON.stringify(contentDelta)}\n\n`
    );
  }

  // Close last content block if any is open
  if (isToolUse || hasStartedTextBlock) {
    const contentBlockStop: MessageEvent = {
      type: "content_block_stop",
      index: contentBlockIndex,
    };

    write(
      `event: content_block_stop\ndata: ${JSON.stringify(contentBlockStop)}\n\n`
    );
  }

  res.locals.transformedCompletion = currentContentBlocks;
  for (const [name, plugin] of PLUGINS.entries()) {
    if (name.includes(",") && !name.startsWith(`${req.provider},`)) {
      continue;
    }
    if (plugin.afterTransformResponse) {
      const hookResult = await plugin.afterTransformResponse(req, res, {
        completion: res.locals.completion,
        transformedCompletion: res.locals.transformedCompletion,
      });
      if (hookResult) {
        res.locals.transformedCompletion = hookResult;
      }
    }
  }

  // Send message_delta event with appropriate stop_reason
  const messageDelta: MessageEvent = {
    type: "message_delta",
    delta: {
      stop_reason: isToolUse ? "tool_use" : "end_turn",
      stop_sequence: null,
      content: res.locals.transformedCompletion,
    },
    usage: { input_tokens: 100, output_tokens: 150 },
  };
  if (!isToolUse) {
    log("body: ", req.body, "messageDelta: ", messageDelta);
  }

  write(`event: message_delta\ndata: ${JSON.stringify(messageDelta)}\n\n`);

  // Send message_stop event
  const messageStop: MessageEvent = {
    type: "message_stop",
  };

  write(`event: message_stop\ndata: ${JSON.stringify(messageStop)}\n\n`);
  res.end();
}

// Add helper function at the top of the file
function isValidJson(str: string): boolean {
  // Check if the string contains both opening and closing braces/brackets
  const hasOpenBrace = str.includes("{");
  const hasCloseBrace = str.includes("}");
  const hasOpenBracket = str.includes("[");
  const hasCloseBracket = str.includes("]");

  // Check if we have matching pairs
  if ((hasOpenBrace && !hasCloseBrace) || (!hasOpenBrace && hasCloseBrace)) {
    return false;
  }
  if (
    (hasOpenBracket && !hasCloseBracket) ||
    (!hasOpenBracket && hasCloseBracket)
  ) {
    return false;
  }

  // Count nested braces/brackets
  let braceCount = 0;
  let bracketCount = 0;

  for (const char of str) {
    if (char === "{") braceCount++;
    if (char === "}") braceCount--;
    if (char === "[") bracketCount++;
    if (char === "]") bracketCount--;

    // If we ever go negative, the JSON is invalid
    if (braceCount < 0 || bracketCount < 0) {
      return false;
    }
  }

  // All braces/brackets should be matched
  return braceCount === 0 && bracketCount === 0;
}
