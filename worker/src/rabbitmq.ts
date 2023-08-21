import amqp from "amqplib"

type HandlerFn = (msg: any, headers?: any) => void | Promise<void>

type EventHandler = {
    event: string
    fn: HandlerFn
}

export class RabbitMQ {

    private amqpConnection: amqp.Connection;
    private options: amqp.Options.Connect
    private amqpChannel: amqp.Channel
    private queueListeneres: { [key: string]: QueueRouter[] } = {}

    private channelPrefetch: number = -1

    constructor(hostname: string, port: number | string, username?: string, password?: string) {
        this.options = {
            hostname,
            port: Number(port),
            username,
            password
        }
    }

    async connect() {
        this.amqpConnection = await amqp.connect(this.options, {})
        this.amqpChannel = await this.amqpConnection.createChannel()
        if (this.channelPrefetch > 0) {
            this.amqpChannel.prefetch(this.channelPrefetch)
        }
        this.amqpChannel.on('cancel', (e) => {
            //queue was deleted, exit process
            process.exit(2)
        })
    }

    listen() {
        const queues = Object.keys(this.queueListeneres)
        for (const queue of queues) {
            this.amqpChannel.consume(queue, async (msg) => {
                for (const ql of this.queueListeneres[queue]) {
                    if (msg == null)
                        return

                    try {
                        await ql.handle(msg)
                        this.amqpChannel.ack(msg)
                    } catch (e) {
                        this.amqpChannel.nack(msg, false, false)
                        console.log(e)
                    }
                }
            }, { noAck: false })
        }
    }

    channel() {
        return this.amqpChannel
    }

    async checkQueue(name: string) {
        return await this.amqpChannel.checkQueue(name)
    }

    async createExchange(name: string, type: string, options?: amqp.Options.AssertExchange) {
        await this.amqpChannel.assertExchange(name, type, options)
    }

    async createQueue(name: string, options?: amqp.Options.AssertQueue) {
        await this.amqpChannel.assertQueue(name, options)
    }

    async bindQueue(name_queue: string, name_ex: string, routing_key: string, args?: any) {
        await this.amqpChannel.bindQueue(name_queue, name_ex, routing_key, args)
    }

    async deleteQueue(queue: string, options?: amqp.Options.DeleteQueue) {
        await this.amqpChannel.deleteQueue(queue, options)
    }

    async deleteExchange(exchange: string, options?: amqp.Options.DeleteExchange) {
        await this.amqpChannel.deleteExchange(exchange, options)
    }

    addlistenerQueue(listener: QueueRouter) {
        const queue = listener.queueName()
        if (this.queueListeneres[queue]) {
            this.queueListeneres[queue].push(listener)
        } else {
            this.queueListeneres[queue] = [listener]
        }
    }

    sendToQueue(queue: string, content: unknown, options?: amqp.Options.Publish) {
        this.amqpChannel.sendToQueue(queue, Buffer.from(JSON.stringify(content)), options)
    }

    publish(ex: string, routing_key: string, content: unknown, options?: amqp.Options.Publish) {
        this.amqpChannel.publish(ex, routing_key, Buffer.from(JSON.stringify(content)), options)
    }

    prefetch(count: number) {
        this.channelPrefetch = count
    }
}


export class QueueRouter {

    private handlers: EventHandler[] = []
    private queue: string

    constructor(queue: string) {
        this.queue = queue
    }

    async handle(msg: amqp.ConsumeMessage) {
        if (msg !== null) {
            const headers = msg.properties.headers
            const json = JSON.parse(msg.content.toString())
            const handler = this.handlers.find(h => {
                return h.event == json.event
            })
            if (typeof json.data == 'string') {
                json.data = JSON.parse(json.data)
            }
            if (handler) {
                await handler.fn(json, headers)
            } else {
                throw new Error(`Handler for ${json.event} is undefined. Skip the event`)
            }
        }
    }

    queueName() {
        return this.queue
    }

    event(event: string, fn: HandlerFn) {
        this.handlers.push({ event, fn })
    }
}