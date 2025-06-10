#!/usr/bin/env node
import { run } from "./index";
import { closeService } from "./utils/close";
import { showStatus } from "./utils/status";
import { executeCodeCommand } from "./utils/codeCommand";
import { isServiceRunning } from "./utils/processCheck";
import { version } from "../package.json";

const command = process.argv[2];

const HELP_TEXT = `
Usage: claude-code [command]

Commands:
  start         Start service 
  stop          Stop service
  status        Show service status
  code          Execute code command
  -v, version   Show version information
  -h, help      Show help information

Example:
  claude-code start
  claude-code code "Write a Hello World"
`;

async function waitForService(
  timeout = 10000,
  initialDelay = 1000
): Promise<boolean> {
  // Wait for an initial period to let the service initialize
  await new Promise((resolve) => setTimeout(resolve, initialDelay));

  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (isServiceRunning()) {
      // Wait for an additional short period to ensure service is fully ready
      await new Promise((resolve) => setTimeout(resolve, 500));
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return false;
}

async function main() {
  switch (command) {
    case "start":
      await run({ daemon: true });
      break;
    case "stop":
      await closeService();
      break;
    case "status":
      showStatus();
      break;
    case "code":
      if (!isServiceRunning()) {
        console.log("Service not running, starting service...");
        await run({ daemon: true });
        // Wait for service to start, exit with error if timeout
        if (await waitForService()) {
          executeCodeCommand(process.argv.slice(3));
        } else {
          console.error(
            "Service startup timeout, please manually run claude-code start to start the service"
          );
          process.exit(1);
        }
      } else {
        executeCodeCommand(process.argv.slice(3));
      }
      break;
    case "-v":
    case "version":
      console.log(`claude-code version: ${version}`);
      break;
    case "-h":
    case "help":
      console.log(HELP_TEXT);
      break;
    default:
      console.log(HELP_TEXT);
      process.exit(1);
  }
}

main().catch(console.error);
