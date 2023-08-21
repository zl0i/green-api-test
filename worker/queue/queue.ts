
import { workJob } from '../services/jobWorker.service'
import { QueueRouter, RabbitMQ } from '../src/rabbitmq'

const RABBITMQ_HOST = process.env['RABBITMQ_HOST'] ?? 'localhost'
const RABBITMQ_PORT = process.env['RABBITMQ_PORT'] ?? '5672'
const RABBITMQ_USERNAME = process.env['RABBITMQ_USERNAME'] ?? 'queue'
const RABBITMQ_PASSWORD = process.env['RABBITMQ_PASSWORD'] ?? 'queue'


const queue = new RabbitMQ(RABBITMQ_HOST, RABBITMQ_PORT, RABBITMQ_USERNAME, RABBITMQ_PASSWORD)
queue.prefetch(2)

const listener = new QueueRouter('worker-app')

listener.event('job', async (json, headers) => {
    const jobId = headers.jobId
    const sec = json.data.delay

    await workJob(sec * 1000)

    console.log(`Job ${jobId} completed!`)

    queue.publish(`web-app-ex`, 'retry-0', { event: 'completed-job', data: {} }, {
        contentType: 'application/json',
        persistent: true,
        expiration: undefined,
        headers: {
            jobId
        }
    })
})

queue.addlistenerQueue(listener)

export default queue