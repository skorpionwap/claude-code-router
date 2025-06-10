import { isServiceRunning, cleanupPidFile } from './processCheck';
import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export async function closeService() {
    const PID_FILE = join(homedir(), '.claude-code-router.pid');
    
    if (!isServiceRunning()) {
        console.log("No service is currently running.");
        return;
    }

    try {
        const pid = parseInt(readFileSync(PID_FILE, 'utf-8'));
        process.kill(pid);
        cleanupPidFile();
        console.log("Service has been successfully stopped.");
    } catch (e) {
        console.log("Failed to stop the service. It may have already been stopped.");
        cleanupPidFile();
    }
}
