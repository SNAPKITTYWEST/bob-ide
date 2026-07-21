/**
 * Terminal Executor — Real command execution
 * Allowlist: bash, git, curl, grep, python, npm
 */
import { execSync } from 'child_process';
import { wormChain } from './worm-chain';
const ALLOWLIST = ['bash', 'git', 'curl', 'grep', 'python', 'npm', 'ls', 'pwd', 'cat', 'echo'];
export async function executeCommand(command) {
    const [cmd, ...args] = command.split(' ');
    // Validate
    if (!ALLOWLIST.includes(cmd)) {
        return {
            stdout: '',
            stderr: `❌ Command not allowed: ${cmd}`,
            exitCode: 1,
            wormAnchor: null,
        };
    }
    try {
        // Execute
        const output = execSync(command, {
            encoding: 'utf-8',
            timeout: 30000,
            stdio: 'pipe',
        });
        // Seal to WORM
        const entry = await wormChain.seal({
            command,
            output: output.slice(0, 500),
            timestamp: Date.now(),
        });
        return {
            stdout: output,
            stderr: '',
            exitCode: 0,
            wormAnchor: entry.hash,
        };
    }
    catch (e) {
        return {
            stdout: e.stdout || '',
            stderr: e.message || '',
            exitCode: e.status || 1,
            wormAnchor: null,
        };
    }
}
