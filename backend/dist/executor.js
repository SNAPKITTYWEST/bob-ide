"use strict";
/**
 * Terminal Executor — Real command execution
 * Allowlist: bash, git, curl, grep, python, npm
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCommand = executeCommand;
const child_process_1 = require("child_process");
const worm_chain_1 = require("./worm-chain");
const ALLOWLIST = ['bash', 'git', 'curl', 'grep', 'python', 'npm', 'ls', 'pwd', 'cat', 'echo'];
async function executeCommand(command) {
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
        const output = (0, child_process_1.execSync)(command, {
            encoding: 'utf-8',
            timeout: 30000,
            stdio: 'pipe',
        });
        // Seal to WORM
        const entry = await worm_chain_1.wormChain.seal({
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
