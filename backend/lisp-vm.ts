/**
 * LISP VM Backend — S-expression evaluation
 * Uses apple-ii-universal-machine/lisp
 */

import { wormChain } from './worm-chain';

// Mock LISP VM (real one loads from apple-ii-universal-machine/lisp)
class LispVM {
  private heap: Map<string, any> = new Map();
  private agentStates: Map<string, any> = new Map();

  async eval(sexpr: string, agentId?: string): Promise<any> {
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
      const entry = await wormChain.seal({
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
    } catch (e: any) {
      return {
        result: null,
        error: e.message,
        type: 'error',
        hash: null,
      };
    }
  }

  private evaluateSExpr(sexpr: string): any {
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

  getAgentState(agentId: string): any {
    return this.agentStates.get(agentId) || null;
  }
}

export const lispVM = new LispVM();
