
import { handleJob } from '../src/jobwaiter'
import { QueueRouter, RabbitMQ } from '../src/rabbitmq'

const RABBITMQ_HOST = process.env['RABBITMQ_HOST'] ?? 'localhost'
const RABBITMQ_PORT = process.env['RABBITMQ_PORT'] ?? '5672'
const RABBITMQ_USERNAME = process.env['RABBITMQ_USERNAME'] ?? 'queue'
const RABBITMQ_PASSWORD = process.env['RABBITMQ_PASSWORD'] ?? 'queue'


const queue = new RabbitMQ(RABBITMQ_HOST, RABBITMQ_PORT, RABBITMQ_USERNAME, RABBITMQ_PASSWORD)
queue.prefetch(1)

const listener = new QueueRouter('web-app')

listener.event('completed-job', async (json, headers) => {
    console.log(`Received completed job ${headers.jobId}!`)
    const jobId = headers.jobId
    handleJob(jobId, json.data)
})

queue.addlistenerQueue(listener)

export default queue