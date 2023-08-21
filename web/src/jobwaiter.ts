
interface IJobStorage {
    [key: string]: (value: unknown) => void
}

const jobStorage: IJobStorage = {}


export async function waitJob(id: string) {
    const prom = new Promise((resolve, reject) => {
        jobStorage[id] = resolve
    })
    return prom
}

export function handleJob(jobId: string, data: any) {
    const resolve = jobStorage[jobId]
    resolve(data)
}