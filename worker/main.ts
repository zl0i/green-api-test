import queue from "./queue/queue"

async function main() {

    await queue.connect()
    queue.listen()
    console.log('[OK] Queue is connected!')
}

main()
    .then(() => { })
    .catch(err => {
        console.log(err)
    })