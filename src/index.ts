import { existsSync } from "fs";
import { writeFile } from "fs/promises";
import { getOpenAICommonOptions, initConfig, initDir } from "./utils";
import { createServer } from "./server";
import { formatRequest } from "./middlewares/formatRequest";
import { rewriteBody } from "./middlewares/rewriteBody";
import OpenAI from "openai";
import { streamOpenAIResponse } from "./utils/stream";
import { isServiceRunning, savePid } from "./utils/processCheck";
import { fork } from "child_process";

async function initializeClaudeConfig() {
  const homeDir = process.env.HOME;
  const configPath = `${homeDir}/.claude.json`;
  if (!existsSync(configPath)) {
    const userID = Array.from(
      { length: 64 },
      () => Math.random().toString(16)[2]
    ).join("");
    const configContent = {
      numStartups: 184,
      autoUpdaterStatus: "enabled",
      userID,
      hasCompletedOnboarding: true,
      lastOnboardingVersion: "1.0.17",
      projects: {},
    };
    await writeFile(configPath, JSON.stringify(configContent, null, 2));
  }
}

interface RunOptions {
  port?: number;
  daemon?: boolean;
}

async function run(options: RunOptions = {}) {
  const port = options.port || 3456;

  // Check if service is already running
  if (isServiceRunning()) {
    console.log("✅ Service is already running in the background.");
    return;
  }

  await initializeClaudeConfig();
  await initDir();
  await initConfig();

  // Save the PID of the background process
  savePid(process.pid);

  // Use port from environment variable if set (for background process)
  const servicePort = process.env.SERVICE_PORT
    ? parseInt(process.env.SERVICE_PORT)
    : port;

  const server = createServer(servicePort);
  server.useMiddleware(formatRequest);
  server.useMiddleware(rewriteBody);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
    ...getOpenAICommonOptions(),
  });
  server.app.post("/v1/messages", async (req, res) => {
    try {
      if (process.env.OPENAI_MODEL) {
        req.body.model = process.env.OPENAI_MODEL;
      }
      const completion: any = await openai.chat.completions.create(req.body);
      await streamOpenAIResponse(res, completion, req.body.model, req.body);
    } catch (e) {
      console.error("Error in OpenAI API call:", e);
    }
  });
  server.start();
  console.log(`🚀 Claude Code Router is running on port ${servicePort}`);
}

export { run };
