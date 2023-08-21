import queue from "../../queue/queue"
import express from 'express'
import { v4 as uuidv4 } from 'uuid';
import { waitJob } from "../../src/jobwaiter";


export class JobController {

    static async work({ delay }: any) {
        const jobId = uuidv4()
        queue.publish(`worker-app-ex`, 'retry-0', { event: 'job', data: { delay } }, {
            contentType: 'application/json',
            persistent: true,
            expiration: undefined,
            headers: {
                jobId
            }
        })
        console.log(`Job ${jobId} publish!`)
        await waitJob(jobId)
        return true
    }
}