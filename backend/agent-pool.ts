/**
 * Agent Pool — Task orchestration
 * DAG scheduling + result aggregation
 */

import { wormChain } from './worm-chain';

export interface Task {
  id: string;
  agent: string;
  input: any;
  dependsOn?: string[];
}

export interface TaskResult {
  taskId: string;
  agent: string;
  result: any;
  wormAnchor: string;
}

export class AgentPool {
  private tasks: Map<string, Task> = new Map();
  private results: Map<string, TaskResult> = new Map();
  private maxConcurrent = 4;

  async execute(tasks: Task[]): Promise<TaskResult[]> {
    // Store tasks
    tasks.forEach(t => this.tasks.set(t.id, t));

    // Build DAG and execute
    const results: TaskResult[] = [];

    for (const task of tasks) {
      // Wait for dependencies
      if (task.dependsOn) {
        await Promise.all(
          task.dependsOn.map(id => this.waitForTask(id))
        );
      }

      // Execute task
      const result = await this.executeTask(task);
      results.push(result);
    }

    // Seal results to WORM
    const entry = await wormChain.seal({
      type: 'agent-pool-execute',
      taskCount: tasks.length,
      results: results.map(r => ({ id: r.taskId, status: 'complete' })),
    });

    return results;
  }

  private async executeTask(task: Task): Promise<TaskResult> {
    // Mock agent execution
    const result = {
      [task.agent]: `Executed: ${JSON.stringify(task.input)}`,
    };

    const taskResult: TaskResult = {
      taskId: task.id,
      agent: task.agent,
      result,
      wormAnchor: (await wormChain.seal(result)).hash,
    };

    this.results.set(task.id, taskResult);
    return taskResult;
  }

  private waitForTask(taskId: string): Promise<void> {
    return new Promise(resolve => {
      const check = () => {
        if (this.results.has(taskId)) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  streamStatus(socket: any) {
    // Mock WebSocket streaming
    socket.send(JSON.stringify({
      type: 'agent-status',
      agents: Array.from(this.tasks.keys()).length,
      completed: Array.from(this.results.keys()).length,
    }));
  }
}

export const agentPool = new AgentPool();
