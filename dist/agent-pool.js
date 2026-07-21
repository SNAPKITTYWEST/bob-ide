/**
 * Agent Pool — Task orchestration
 * DAG scheduling + result aggregation
 */
import { wormChain } from './worm-chain';
export class AgentPool {
    constructor() {
        this.tasks = new Map();
        this.results = new Map();
        this.maxConcurrent = 4;
    }
    async execute(tasks) {
        // Store tasks
        tasks.forEach(t => this.tasks.set(t.id, t));
        // Build DAG and execute
        const results = [];
        for (const task of tasks) {
            // Wait for dependencies
            if (task.dependsOn) {
                await Promise.all(task.dependsOn.map(id => this.waitForTask(id)));
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
    async executeTask(task) {
        // Mock agent execution
        const result = {
            [task.agent]: `Executed: ${JSON.stringify(task.input)}`,
        };
        const taskResult = {
            taskId: task.id,
            agent: task.agent,
            result,
            wormAnchor: (await wormChain.seal(result)).hash,
        };
        this.results.set(task.id, taskResult);
        return taskResult;
    }
    waitForTask(taskId) {
        return new Promise(resolve => {
            const check = () => {
                if (this.results.has(taskId)) {
                    resolve();
                }
                else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }
    streamStatus(socket) {
        // Mock WebSocket streaming
        socket.send(JSON.stringify({
            type: 'agent-status',
            agents: Array.from(this.tasks.keys()).length,
            completed: Array.from(this.results.keys()).length,
        }));
    }
}
export const agentPool = new AgentPool();
