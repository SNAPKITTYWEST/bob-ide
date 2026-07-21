/**
 * BOB IDE Backend Server
 * Real terminal execution, command routing, artifact management
 * Will be powered by sov-kernel-monster
 */
import Fastify from 'fastify';
import fastifyWs from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import { execSync, spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { WasmEngine } from './wasm';
import { compileNaturalLanguageToXML, controlModelViaXML, } from './xml-compiler-bridge';
// Import all 5 backend components
import { executeCommand } from './executor';
import { lispVM } from './lisp-vm';
import { routeToMCP } from './mcp-router';
import { agentPool } from './agent-pool';
import { wormChain } from './worm-chain';
const app = Fastify({ logger: true });
const wasmEngine = new WasmEngine();
// Initialize WORM chain on startup
await wormChain.initialize();
// Register plugins
await app.register(fastifyWs);
await app.register(fastifyStatic, {
    root: path.join(process.cwd(), 'dist'),
});
const sessions = new Map();
function generateSessionId() {
    return `term-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
// =====================================================================
// TERMINAL ENDPOINTS
// =====================================================================
// Create new terminal session
app.post('/api/terminal/create', async (req) => {
    const sessionId = generateSessionId();
    const session = {
        id: sessionId,
        cwd: process.cwd(),
        env: { ...process.env },
        history: [],
    };
    sessions.set(sessionId, session);
    return { sessionId, cwd: session.cwd };
});
// Close terminal session
app.delete('/api/terminal/:id', async (req) => {
    const { id } = req.params;
    sessions.delete(id);
    return { ok: true };
});
// =====================================================================
// COMMAND EXECUTION
// =====================================================================
app.post('/api/execute', async (req, reply) => {
    const { sessionId, cmd, cwd: newCwd } = req.body;
    const session = sessions.get(sessionId);
    if (!session) {
        reply.status(404).send({ error: 'Session not found' });
        return;
    }
    try {
        // Update working directory if provided
        if (newCwd)
            session.cwd = newCwd;
        // Add to history
        session.history.push(cmd);
        // Execute command
        const output = execSync(cmd, {
            cwd: session.cwd,
            env: session.env,
            encoding: 'utf-8',
            timeout: 30000,
        }).trim();
        return {
            ok: true,
            output,
            cwd: session.cwd,
            exitCode: 0,
        };
    }
    catch (error) {
        return {
            ok: false,
            output: error.stderr || error.message,
            cwd: session.cwd,
            exitCode: error.status || 1,
            error: error.message,
        };
    }
});
// =====================================================================
// FILE OPERATIONS
// =====================================================================
app.get('/api/file/*', async (req, reply) => {
    try {
        const filePath = req.params.path;
        const fullPath = path.join(process.cwd(), filePath);
        // Safety: prevent directory traversal
        if (!fullPath.startsWith(process.cwd())) {
            reply.status(403).send({ error: 'Access denied' });
            return;
        }
        const content = await fs.readFile(fullPath, 'utf-8');
        return { content, path: filePath };
    }
    catch (error) {
        reply.status(404).send({ error: error.message });
    }
});
app.post('/api/file/write', async (req) => {
    const { path: filePath, content } = req.body;
    const fullPath = path.join(process.cwd(), filePath);
    if (!fullPath.startsWith(process.cwd())) {
        return { error: 'Access denied' };
    }
    try {
        await fs.writeFile(fullPath, content, 'utf-8');
        return { ok: true, path: filePath };
    }
    catch (error) {
        return { error: error.message };
    }
});
// =====================================================================
// WASM ENGINE ENDPOINTS
// =====================================================================
app.post('/api/wasm/load', async (req) => {
    const { name, wasmBuffer } = req.body;
    try {
        const buffer = Buffer.from(wasmBuffer, 'base64');
        const contextId = await wasmEngine.loadModule(name, buffer);
        return { ok: true, contextId };
    }
    catch (error) {
        return { error: error.message };
    }
});
app.post('/api/wasm/call', async (req) => {
    const { contextId, fn, args } = req.body;
    try {
        const result = await wasmEngine.call(contextId, fn, args);
        return { ok: true, result };
    }
    catch (error) {
        return { error: error.message };
    }
});
app.post('/api/wasm/read', async (req) => {
    const { contextId, ptr, len } = req.body;
    try {
        const data = wasmEngine.readMemory(contextId, ptr, len);
        return { ok: true, data: data.toString('base64') };
    }
    catch (error) {
        return { error: error.message };
    }
});
app.post('/api/wasm/write', async (req) => {
    const { contextId, ptr, data } = req.body;
    try {
        const buffer = Buffer.from(data, 'base64');
        wasmEngine.writeMemory(contextId, ptr, buffer);
        return { ok: true };
    }
    catch (error) {
        return { error: error.message };
    }
});
app.post('/api/wasm/alloc', async (req) => {
    const { contextId, size } = req.body;
    try {
        const ptr = await wasmEngine.allocate(contextId, size);
        return { ok: true, ptr };
    }
    catch (error) {
        return { error: error.message };
    }
});
app.post('/api/wasm/free', async (req) => {
    const { contextId, ptr } = req.body;
    try {
        await wasmEngine.deallocate(contextId, ptr);
        return { ok: true };
    }
    catch (error) {
        return { error: error.message };
    }
});
app.get('/api/wasm/:contextId/stats', async (req) => {
    const { contextId } = req.params;
    const stats = wasmEngine.getStats(contextId);
    return stats || { error: 'Context not found' };
});
// =====================================================================
// REAL-TIME TERMINAL (WebSocket)
// =====================================================================
app.register(async (fastify) => {
    fastify.get('/api/terminal/:id/ws', { websocket: true }, (socket, req) => {
        const sessionId = req.params.id;
        const session = sessions.get(sessionId);
        if (!session) {
            socket.send(JSON.stringify({ error: 'Session not found' }));
            socket.close();
            return;
        }
        // Spawn interactive shell
        const shell = spawn('bash', [], {
            cwd: session.cwd,
            env: session.env,
            pty: true,
        });
        socket.on('message', (msg) => {
            try {
                const data = JSON.parse(msg.toString());
                if (data.type === 'input') {
                    shell.stdin.write(data.data);
                }
                else if (data.type === 'resize') {
                    if (shell.stdin.isTTY) {
                        shell.stdin.setRawMode(true);
                        shell.stdin.resize(data.cols, data.rows);
                    }
                }
            }
            catch (e) {
                shell.stdin.write(msg);
            }
        });
        shell.stdout.on('data', (data) => {
            socket.send(JSON.stringify({ type: 'output', data: data.toString() }));
        });
        shell.stderr.on('data', (data) => {
            socket.send(JSON.stringify({ type: 'output', data: data.toString() }));
        });
        shell.on('exit', () => {
            socket.send(JSON.stringify({ type: 'exit' }));
            socket.close();
        });
        socket.on('close', () => {
            shell.kill();
        });
    });
    // WASM WebSocket execution
    fastify.get('/api/wasm/:contextId/ws', { websocket: true }, (socket, req) => {
        const { contextId } = req.params;
        wasmEngine.wsHandler(socket, contextId);
    });
});
// =====================================================================
// GREP / SEARCH
// =====================================================================
app.post('/api/grep', async (req) => {
    const { pattern, path: searchPath = '.', recursive = true } = req.body;
    try {
        const flags = recursive ? '-r' : '';
        const output = execSync(`grep -n ${flags} "${pattern}" "${searchPath}"`, {
            cwd: process.cwd(),
            encoding: 'utf-8',
        }).trim();
        return {
            ok: true,
            results: output
                .split('\n')
                .filter((l) => l)
                .map((line) => {
                const [file, lineNum, ...rest] = line.split(':');
                return { file, lineNum: parseInt(lineNum), content: rest.join(':') };
            }),
        };
    }
    catch (error) {
        if (error.status === 1) {
            return { ok: true, results: [] }; // No matches
        }
        return { error: error.message };
    }
});
// =====================================================================
// CURL / HTTP
// =====================================================================
app.post('/api/curl', async (req) => {
    const { url, method = 'GET', headers = {}, body } = req.body;
    try {
        let cmd = `curl -s -X ${method}`;
        for (const [k, v] of Object.entries(headers)) {
            cmd += ` -H "${k}: ${v}"`;
        }
        if (body) {
            cmd += ` -d '${body}'`;
        }
        cmd += ` "${url}"`;
        const output = execSync(cmd, {
            encoding: 'utf-8',
            timeout: 30000,
        }).trim();
        return { ok: true, output };
    }
    catch (error) {
        return { error: error.message };
    }
});
// =====================================================================
// BASH
// =====================================================================
app.post('/api/bash', async (req) => {
    const { script, args = [] } = req.body;
    try {
        const output = execSync(script, {
            cwd: process.cwd(),
            env: process.env,
            encoding: 'utf-8',
            timeout: 30000,
            shell: '/bin/bash',
        }).trim();
        return { ok: true, output };
    }
    catch (error) {
        return { error: error.message, output: error.stdout || '', stderr: error.stderr || '' };
    }
});
// =====================================================================
// OMEGA SHELL (GUARDED COMMAND EXECUTION)
// =====================================================================
const OMEGA_ALLOWLIST = [
    'PWD', 'LS', 'DIR', 'GIT', 'CARGO', 'LAKE', 'DUNE', 'DOTNET',
    'NIM', 'JQ', 'MAKE', 'CMAKE', 'CLANG', 'LLVM-OBJDUMP', 'LLVM-READOBJ',
    'QEMU-SYSTEM-X86_64', 'GREP', 'CURL', 'BASH', 'SH', 'CAT', 'ECHO',
    'FIND', 'WHICH', 'UNAME', 'WHOAMI', 'CHMOD', 'CHOWN', 'NODE', 'NPM',
    'PYTHON', 'PYTHON3', 'RUBY', 'GO', 'RUSTC', 'CARGO', 'GFORTRAN',
    'GCC', 'G++', 'CLANG++', 'JAVA', 'JAVAC', 'GHCI', 'OCAML',
];
app.post('/api/omega/run', async (req, reply) => {
    const { command } = req.body;
    if (!command || !command.trim()) {
        reply.status(400).send({ error: 'No command supplied', exitCode: 77 });
        return;
    }
    // Extract first word (command name)
    const firstWord = command.trim().split(/\s+/)[0].toUpperCase();
    // Check allowlist
    if (!OMEGA_ALLOWLIST.includes(firstWord)) {
        return {
            ok: false,
            output: `[OMEGA:SILENCE] command rejected by allowlist: ${firstWord}`,
            error: 'Command not allowed',
            exitCode: 77,
        };
    }
    // Reject shell metacharacters
    const dangerous = ['&&', '||', ';', '|', '>', '<', '`', '$', '&'];
    for (const char of dangerous) {
        if (command.includes(char)) {
            return {
                ok: false,
                output: '[OMEGA:SILENCE] shell metacharacters rejected',
                error: 'Metacharacters not allowed',
                exitCode: 77,
            };
        }
    }
    try {
        const output = execSync(command, {
            cwd: process.cwd(),
            env: process.env,
            encoding: 'utf-8',
            timeout: 30000,
            stdio: 'pipe',
        }).trim();
        return {
            ok: true,
            output,
            error: '',
            exitCode: 0,
        };
    }
    catch (error) {
        return {
            ok: false,
            output: error.stdout || '',
            error: error.stderr || error.message,
            exitCode: error.status || 1,
        };
    }
});
// =====================================================================
// XML COMPILER (NATURAL LANGUAGE → XML PROMPTS)
// =====================================================================
app.post('/api/xml/compile', async (req) => {
    try {
        const result = await compileNaturalLanguageToXML(req.body);
        return {
            ok: true,
            ...result,
        };
    }
    catch (error) {
        return {
            ok: false,
            error: error.message,
        };
    }
});
// Control mini models (Granite, Nemotron, etc.) via XML-derived prompts
app.post('/api/xml/control-model', async (req) => {
    try {
        const result = await controlModelViaXML(req.body);
        return {
            ok: true,
            ...result,
        };
    }
    catch (error) {
        return {
            ok: false,
            error: error.message,
        };
    }
});
// =====================================================================
// ARTIFACT OPERATIONS
// =====================================================================
app.post('/api/artifact/save', async (req) => {
    const { name, type, content } = req.body;
    const artifactDir = path.join(process.cwd(), '.artifacts');
    try {
        await fs.mkdir(artifactDir, { recursive: true });
        const filePath = path.join(artifactDir, `${name}.${type}`);
        await fs.writeFile(filePath, content);
        return { ok: true, path: filePath };
    }
    catch (error) {
        return { error: error.message };
    }
});
app.get('/api/artifact/:name', async (req, reply) => {
    const { name } = req.params;
    const artifactDir = path.join(process.cwd(), '.artifacts');
    const filePath = path.join(artifactDir, name);
    try {
        const content = await fs.readFile(filePath);
        reply.type('application/octet-stream');
        return content;
    }
    catch (error) {
        reply.status(404).send({ error: error.message });
    }
});
// =====================================================================
// 5 INTEGRATION ENDPOINTS (Built by agents)
// =====================================================================
// 1. Terminal Executor
app.post('/api/execute', async (req) => {
    return executeCommand(req.body.command);
});
// 2. LISP VM Backend
app.post('/api/lisp/eval', async (req) => {
    return lispVM.eval(req.body.sexpr, req.body.agent_id);
});
// 3. MCP Router
app.post('/api/mcp/call', async (req) => {
    return routeToMCP(req.body);
});
// 4. Agent Pool
app.post('/api/agents/execute', async (req) => {
    return agentPool.execute(req.body.tasks);
});
// 5. WORM Chain Info
app.get('/api/worm/chain', async () => {
    return { ledger: wormChain.getChain().slice(-10) };
});
// WebSocket: Agent status streaming
app.get('/api/agents/:id/ws', { websocket: true }, (socket) => {
    if (!agentPool)
        return;
    agentPool.streamStatus(socket);
});
// =====================================================================
// START SERVER
// =====================================================================
const PORT = process.env.PORT || 3000;
try {
    await app.listen({ port: parseInt(String(PORT)), host: '0.0.0.0' });
    console.log(`✅ BOB IDE Backend running on http://localhost:${PORT}`);
    console.log(`📡 Endpoints ready:`);
    console.log(`   POST /api/execute (terminal)`);
    console.log(`   POST /api/lisp/eval (LISP)`);
    console.log(`   POST /api/mcp/call (models)`);
    console.log(`   POST /api/agents/execute (orchestration)`);
    console.log(`   GET /api/worm/chain (WORM)`);
    console.log(`   WS /api/agents/:id (streaming)`);
}
catch (err) {
    app.log.error(err);
    process.exit(1);
}
export default app;
