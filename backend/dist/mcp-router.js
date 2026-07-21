"use strict";
/**
 * MCP Router — Model inference routing
 * Bedrock → Groq → Ollama fallback
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeToMCP = routeToMCP;
const worm_chain_1 = require("./worm-chain");
async function routeToMCP(call) {
    const { tool, function: fn, args } = call;
    try {
        let result;
        // Route by tool
        if (tool === 'bob-mcp') {
            result = await inferenceWithFallback(args);
        }
        else if (tool === 'clojure-lisp-bridge') {
            result = await evalClojure(args);
        }
        else if (tool === 'mathlib5-spec') {
            result = await verifyProof(args);
        }
        else {
            result = { error: `Unknown tool: ${tool}` };
        }
        // Seal to WORM
        const entry = await worm_chain_1.wormChain.seal({
            type: 'mcp-call',
            tool,
            function: fn,
            result: typeof result === 'object' ? result : String(result).slice(0, 100),
        });
        return {
            result,
            signature: entry.signature,
            wormAnchor: entry.hash,
        };
    }
    catch (e) {
        return {
            error: e.message,
            wormAnchor: null,
        };
    }
}
async function inferenceWithFallback(args) {
    // Try Bedrock, fallback to Groq, fallback to Ollama
    try {
        // Mock: would call Bedrock API
        return {
            model: 'bedrock',
            inference: `[Model output for: ${args.prompt}]`,
        };
    }
    catch {
        try {
            // Mock: would call Groq
            return {
                model: 'groq',
                inference: `[Groq: ${args.prompt}]`,
            };
        }
        catch {
            // Mock: would call local Ollama
            return {
                model: 'ollama',
                inference: `[Local: ${args.prompt}]`,
            };
        }
    }
}
async function evalClojure(args) {
    // Mock Clojure evaluation
    return {
        language: 'clojure',
        result: `Evaluated: ${args.code}`,
    };
}
async function verifyProof(args) {
    // Mock Lean proof verification
    return {
        language: 'lean4',
        verified: true,
        theorem: args.theorem,
    };
}
