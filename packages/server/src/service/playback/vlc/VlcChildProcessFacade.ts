import {ChildProcessWithoutNullStreams, SpawnOptionsWithoutStdio} from 'child_process'

import {new_promise} from '../../../new_promise'
import {IVlcChildProcessFacade} from './VlcChildProcessFacade.interface'
import {VlcHttpConnection} from './VlcHttpClient.interface'

export type SpawnFn =
    (command: string, args?: string[], options?: SpawnOptionsWithoutStdio) => ChildProcessWithoutNullStreams

export class ChildProcessFacadeError extends Error {}

export class VlcChildProcessFacade implements IVlcChildProcessFacade {
    private readonly path: string
    private readonly timeout_ms: number
    private readonly spawn_fn: SpawnFn
    private readonly vlc_http_connection: VlcHttpConnection
    private child_process: ChildProcessWithoutNullStreams|null

    public constructor (
        path: string,
        timeout_ms: number,
        spawn_fn: SpawnFn,
        vlc_http_connection: VlcHttpConnection,
    ) {
        this.path = path
        this.timeout_ms = timeout_ms
        this.child_process = null
        this.vlc_http_connection = vlc_http_connection
        this.spawn_fn = spawn_fn
    }

    public get hostname (): string {
        return this.vlc_http_connection.hostname
    }

    public get port (): number {
        return this.vlc_http_connection.port
    }

    public is_running (): boolean {
        return this.child_process !== null
    }

    public get_pid (): number {
        return this.process.pid
    }

    public async start (): Promise<void> {
        const {promise, resolve, reject} = new_promise<string>()
        const child_process = this.spawn()
        const timeout_id = setTimeout(() => reject(new ChildProcessFacadeError('Timeout')), this.timeout_ms)
        const on_data = (data: string|Buffer): void => resolve(data.toString())

        const on_error = (error: Error): void => {
            child_process.once('exit', () => reject(new ChildProcessFacadeError(`Unexpected error: ${error.message}`)))
            child_process.kill()
        }

        child_process.stdout.on('error', on_error)
        child_process.stdout.on('data', on_data)

        await promise
            .tap(() => this.child_process = child_process) // eslint-disable-line no-return-assign
            .tapCatch((_error: Error) => child_process.kill())
            .finally(() => {
                clearTimeout(timeout_id)
                child_process.stdout.off('error', on_error)
                child_process.stdout.off('data', on_data)
            })
    }

    public async stop (): Promise<void> {
        const {promise, resolve} = new_promise()

        this.process.once('close', (_code, _signal) => {
            this.child_process = null
            resolve()
        })
        this.process.kill()

        return promise
    }

    private get process (): ChildProcessWithoutNullStreams {
        if (!this.child_process) {
            throw new ChildProcessFacadeError('Child process not running')
        }

        return this.child_process
    }

    private spawn (): ChildProcessWithoutNullStreams {
        if (this.is_running()) {
            throw new ChildProcessFacadeError('Instance already running')
        }

        const {hostname, port, password} = this.vlc_http_connection
        const args = [
            '--intf', 'cli',
            '--control', 'http',
            '--http-host', hostname,
            '--http-port', String(port),
            '--http-password', password,
        ]
        const child_process = this.spawn_fn(this.path, args)
        child_process.stdout.on('readable', child_process.stdout.read)
        child_process.stderr.on('readable', child_process.stderr.read)

        return child_process
    }
}
