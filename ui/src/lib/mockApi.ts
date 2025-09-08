// Mock API for demonstration purposes
export const mockConfig = {
  PORT: 8080,
  HOST: "localhost",
  API_TIMEOUT_MS: "30000",
  PROXY_URL: "",
  APIKEY: "demo-key",
  LOG: true,
  LOG_LEVEL: "info",
  CLAUDE_PATH: "/claude",
  StatusLine: {
    enabled: true,
    currentStyle: "default",
    default: { modules: [] },
    powerline: { modules: [] }
  },
  Providers: [],
  Router: {
    default: "claude-3-5-sonnet",
    background: "claude-3-5-sonnet", 
    think: "claude-3-5-sonnet",
    longContext: "claude-3-5-sonnet",
    longContextThreshold: 8000,
    webSearch: "claude-3-5-sonnet"
  },
  transformers: []
};

export const mockApi = {
  getConfig: async () => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return mockConfig;
  },
  
  updateConfig: async (config: any) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, message: 'Configuration saved successfully' };
  },
  
  restartService: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Service restarted successfully' };
  },
  
  checkForUpdates: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      hasUpdate: false, 
      latestVersion: undefined, 
      changelog: undefined 
    };
  },
  
  performUpdate: async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, message: 'Update completed successfully' };
  }
};