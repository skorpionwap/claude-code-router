import { FastifyInstance } from 'fastify';

export interface AnalyticsPluginConfig {
  enabled: boolean;
  dataRetentionDays?: number;
  realTimeUpdates?: boolean;
  missionControlEnabled?: boolean;
}

export interface Plugin {
  install(server: FastifyInstance, config: any): void;
  uninstall?(): void;
}

export interface PluginConfig {
  analytics?: AnalyticsPluginConfig;
  [key: string]: any;
}