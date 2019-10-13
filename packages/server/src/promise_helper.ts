import Bluebird from 'bluebird'

export interface PromiseParts<T> {
    promise: Bluebird<T>
    resolve: (value: T) => void
    reject: (error: Error) => void
}

export function new_promise<T> (): PromiseParts<T> {
    let resolver: (value: T) => void
    let rejector: (error: Error) => void

    const promise: Promise<T> = new Bluebird<T>(function (resolve, reject) {
        resolver = resolve
        rejector = reject
    })

    // @ts-ignore - We know that the callback in the Promise-constructor is run synchronously
    return {promise, resolve: resolver, reject: rejector}
}
