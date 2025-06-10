import { spawn } from 'child_process';
import { isServiceRunning } from './processCheck';

export async function executeCodeCommand(args: string[] = []) {
    // Service check is now handled in cli.ts

    // Set environment variables
    const env = {
        ...process.env,
        DISABLE_PROMPT_CACHING: '1',
        ANTHROPIC_AUTH_TOKEN: 'test',
        ANTHROPIC_BASE_URL: 'http://127.0.0.1:3456',
        API_TIMEOUT_MS: '600000'
    };

    // Execute claude command
    const claudeProcess = spawn('claude', args, {
        env,
        stdio: 'inherit',
        shell: true
    });

    claudeProcess.on('error', (error) => {
        console.error('Failed to start claude command:', error.message);
        console.log('Make sure Claude Code is installed: npm install -g @anthropic-ai/claude-code');
        process.exit(1);
    });

    claudeProcess.on('close', (code) => {
        process.exit(code || 0);
    });
}
