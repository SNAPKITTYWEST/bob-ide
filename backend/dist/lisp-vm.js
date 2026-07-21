"use strict";
/**
 * LISP VM Backend — S-expression evaluation
 * Uses apple-ii-universal-machine/lisp
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.lispVM = void 0;
const worm_chain_1 = require("./worm-chain");
// Mock LISP VM (real one loads from apple-ii-universal-machine/lisp)
class LispVM {
    constructor() {
        this.heap = new Map();
        this.agentStates = new Map();
    }
    async eval(sexpr, agentId) {
        try {
            // Parse and evaluate
            const result = this.evaluateSExpr(sexpr);
            // Track agent state
            if (agentId) {
                this.agentStates.set(agentId, {
                    lastExpr: sexpr,
                    result,
                    timestamp: Date.now(),
                });
            }
            // Seal to WORM
            const entry = await worm_chain_1.wormChain.seal({
                type: 'lisp-eval',
                expr: sexpr,
                result,
                agent: agentId || 'system',
            });
            return {
                result,
                type: typeof result,
                hash: entry.hash,
                wormAnchor: entry.hash,
            };
        }
        catch (e) {
            return {
                result: null,
                error: e.message,
                type: 'error',
                hash: null,
            };
        }
    }
    evaluateSExpr(sexpr) {
        const trimmed = sexpr.trim();
        // Simple evaluator for basic S-expressions
        if (trimmed.startsWith('(+')) {
            const nums = trimmed
                .replace(/^\(/, '')
                .replace(/\)$/, '')
                .split(' ')
                .slice(1)
                .map(Number);
            return nums.reduce((a, b) => a + b, 0);
        }
        if (trimmed.startsWith('(agent-state)')) {
            return {
                heap: Array.from(this.heap.entries()),
                agents: Array.from(this.agentStates.entries()),
            };
        }
        if (trimmed.startsWith('(defn')) {
            // Store function
            return `defined`;
        }
        return sexpr; // Echo
    }
    getAgentState(agentId) {
        return this.agentStates.get(agentId) || null;
    }
}
exports.lispVM = new LispVM();
