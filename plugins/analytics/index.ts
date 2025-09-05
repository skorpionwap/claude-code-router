import { FastifyInstance } from 'fastify';
import { analyticsRoutes } from './routes/analytics';
import { missionControlRoutes } from './routes/mission-control';
import { analytics } from './manager';

export default class AnalyticsPlugin {
  private analytics: any;
  
  install(server: FastifyInstance, config: any) {
    console.log('🔌 Installing Analytics Plugin...');
    
    // Initialize analytics manager
    this.analytics = analytics;
    this.analytics.updateConfig(config);
    
    // Register Analytics routes (they already have /api/analytics prefix in routes)
    server.register(analyticsRoutes);
    console.log('✅ Analytics routes registered');
    
    // Register Mission Control routes (keeps existing /api/v1/mission-control prefix)
    server.register(missionControlRoutes);
    console.log('✅ Mission Control routes registered');
    
    // Add analytics tracking hooks
    server.addHook('onSend', this.handleResponse.bind(this));
    server.addHook('onError', this.handleError.bind(this));
    
    console.log('✅ Analytics Plugin installed successfully');
  }
  
  private async handleResponse(req: any, reply: any, payload: any) {
    // Handle analytics tracking on response
    if (req.sessionId && req.url.startsWith("/v1/messages")) {
      // Track usage for analytics
      if (typeof payload === 'object' && payload?.usage) {
        // Track the usage data
        // This is handled by existing cache mechanism
      }
    }
    return payload;
  }
  
  private async handleError(request: any, reply: any, error: any) {
    // Handle error tracking for analytics
    console.error('Analytics Plugin - Error tracked:', error.message);
  }
}