

export async function workJob(d: number) {
    await delay(d)
}


async function delay(milliseconds: number) {
    return new Promise((resole, _reject) => setTimeout(resole, milliseconds))
};