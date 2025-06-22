import Module from "node:module";
import { streamOpenAIResponse } from "../utils/stream";
import { log } from "../utils/log";
import { PLUGINS_DIR } from "../constants";
import path from "node:path";
import { access } from "node:fs/promises";
import { OpenAI } from "openai";
import { createClient } from "../utils";
import { Response } from "express";

// @ts-ignore
const originalLoad = Module._load;
// @ts-ignore
Module._load = function (request, parent, isMain) {
  if (request === "claude-code-router") {
    return {
      streamOpenAIResponse,
      log,
      OpenAI,
      createClient,
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

export type PluginHook =
  | "beforeRouter"
  | "afterRouter"
  | "beforeTransformRequest"
  | "afterTransformRequest"
  | "beforeTransformResponse"
  | "afterTransformResponse";

export interface Plugin {
  beforeRouter?: (req: any, res: Response) => Promise<any>;
  afterRouter?: (req: any, res: Response) => Promise<any>;

  beforeTransformRequest?: (req: any, res: Response) => Promise<any>;
  afterTransformRequest?: (req: any, res: Response) => Promise<any>;

  beforeTransformResponse?: (
    req: any,
    res: Response,
    data?: { completion: any }
  ) => Promise<any>;
  afterTransformResponse?: (
    req: any,
    res: Response,
    data?: { completion: any; transformedCompletion: any }
  ) => Promise<any>;
}

export const PLUGINS = new Map<string, Plugin>();

const loadPlugin = async (pluginName: string) => {
  const filePath = pluginName.split(",").pop();
  const pluginPath = path.join(PLUGINS_DIR, `${filePath}.js`);
  try {
    await access(pluginPath);
    const plugin = require(pluginPath);
    if (
      [
        "beforeRouter",
        "afterRouter",
        "beforeTransformRequest",
        "afterTransformRequest",
        "beforeTransformResponse",
        "afterTransformResponse",
      ].some((key) => key in plugin)
    ) {
      PLUGINS.set(pluginName, plugin);
      log(`Plugin ${pluginName} loaded successfully.`);
    } else {
      throw new Error(`Plugin ${pluginName} does not export a function.`);
    }
  } catch (e) {
    console.error(`Failed to load plugin ${pluginName}:`, e);
    throw e;
  }
};

export const loadPlugins = async (pluginNames: string[]) => {
  console.log("Loading plugins:", pluginNames);
  for (const file of pluginNames) {
    await loadPlugin(file);
  }
};

export const usePluginMiddleware = (type: PluginHook) => {
  return async (req: any, res: Response, next: any) => {
    for (const [name, plugin] of PLUGINS.entries()) {
      if (name.includes(",") && !name.startsWith(`${req.provider},`)) {
        continue;
      }
      if (plugin[type]) {
        try {
          await plugin[type](req, res);
          log(`Plugin ${name} executed hook: ${type}`);
        } catch (error) {
          log(`Error in plugin ${name} during hook ${type}:`, error);
        }
      }
    }
    next();
  };
};
