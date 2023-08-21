import { api } from "./api/api"
import queue from "./queue/queue"
import { QueueCreator } from "./src/queueCreator"

async function main() {



    await queue.connect()
    console.log('[OK] Queue is connected!')
    
    await QueueCreator.create({name: "worker-app", is_dlx: true, count_retry: 2, retry_timeout_sec: 30 })
    await QueueCreator.create({name: "web-app", is_dlx: true, count_retry: 1, retry_timeout_sec: 15 })

    queue.listen()
    

    

    // console.log(await queue.checkQueue('web-app'))
    // console.log(await queue.checkQueue('worker-app'))

    api.listen(api.get('port'), () => {
        console.log('[OK] Server is running!')
    })
}

main()
    .then(() => { })
    .catch(err => {
        console.log(err)
    })