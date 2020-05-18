import sinon, {SinonStub} from 'sinon'

type AnyFunction = (...args: any[]) => any

const {stub} = sinon
const methods: Array<keyof typeof console> = [
    'debug',
    'dir',
    'dirxml',
    'error',
    'info',
    'log',
    'trace',
    'warn',
]

export function with_console_silenced<T extends AnyFunction>(fn: T): ReturnType<T> {
    const spies: SinonStub[] = methods.map(method => stub(console, method))
    const restore = (): void => spies.forEach(mock => mock.restore())
    let result

    try {
        result = fn()
    } catch (error) {
        restore()
        throw error
    }

    if (typeof result.then !== 'function') {
        restore()
        return result
    }

    return result
        .then(function (value: T) {
            restore()
            return value
        })
        .catch(function (error: Error) {
            restore()
            throw error
        })
}
