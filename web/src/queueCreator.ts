import queue from "../queue/queue";



export interface Queues {
    name: string
    is_dlx: boolean
    count_retry: number
    retry_timeout_sec: number
}

export class QueueCreator {

    static async create(q: Queues) {
        if (q.is_dlx) {
            await queue.createExchange(`${q.name}-ex`, 'direct', { durable: true });
            await queue.createQueue(q.name, { durable: true, deadLetterExchange: `${q.name}-fail-ex`, });
            await queue.bindQueue(q.name, `${q.name}-ex`, `retry-0`);
            await queue.createExchange(`${q.name}-fail-ex`, 'direct', { internal: true, durable: true });

            let retry = 1;
            for (; retry < q.count_retry + 1; retry++) {
                await queue.createQueue(`${q.name}-retry-${retry}`, {
                    durable: true,
                    deadLetterExchange: `${q.name}-ex`,
                    deadLetterRoutingKey: `retry-${retry}`,
                    messageTtl: q.retry_timeout_sec * 1000 * retry,
                });
                await queue.bindQueue(`${q.name}-retry-${retry}`, `${q.name}-fail-ex`, `retry-${retry - 1}`);
                await queue.bindQueue(q.name, `${q.name}-ex`, `retry-${retry}`);
            }
            await queue.createQueue(`${q.name}-error`, { durable: true, messageTtl: 604_800_000, arguments: { 'x-queue-mode': 'lazy' } }); //1 week
            await queue.bindQueue(`${q.name}-error`, `${q.name}-fail-ex`, `retry-${retry - 1}`);
        } else {
            await queue.createExchange(`${q.name}-ex`, 'direct', { durable: true });
            await queue.createQueue(q.name, { durable: true });
            await queue.bindQueue(q.name, `${q.name}-ex`, `retry-0`);
        }
    }

    static async delete(q: Queues) {
        await queue.deleteExchange(`${q.name}-ex`)
        await queue.deleteExchange(`${q.name}-fail-ex`)
        await queue.deleteQueue(q.name)
        if (q.is_dlx) {
            for (let retry = 1; retry < q.count_retry + 1; retry++) {
                await queue.deleteQueue(`${q.name}-retry-${retry}`)
            }
            await queue.deleteQueue(`${q.name}-error`)
        }
    }
}