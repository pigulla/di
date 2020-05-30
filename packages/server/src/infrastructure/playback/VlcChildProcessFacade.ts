import {ChildProcessWithoutNullStreams, SpawnOptionsWithoutStdio} from 'child_process'

import wait_port from 'wait-port'

import {new_promise} from '../../new_promise'

import {IVlcChildProcessFacade} from './VlcChildProcessFacade.interface'
import {VlcHttpConnection} from './VlcHttpClient.interface'

export type SpawnFn = (
    command: string,
    args?: string[],
    options?: SpawnOptionsWithoutStdio
) => ChildProcessWithoutNullStreams

export class ChildProcessFacadeError extends Error {}

export class VlcChildProcessFacade implements IVlcChildProcessFacade {
    private readonly path: string
    private readonly timeout_ms: number
    private readonly spawn_fn: SpawnFn
    private readonly vlc_http_connection: VlcHttpConnection
    private child_process: ChildProcessWithoutNullStreams | null

    public constructor(
        path: string,
        timeout_ms: number,
        spawn_fn: SpawnFn,
        vlc_http_connection: VlcHttpConnection
    ) {
        this.path = path
        this.timeout_ms = timeout_ms
        this.child_process = null
        this.vlc_http_connection = vlc_http_connection
        this.spawn_fn = spawn_fn
    }

    public get hostname(): string {
        return this.vlc_http_connection.hostname
    }

    public get port(): number {
        return this.vlc_http_connection.port
    }

    public is_running(): boolean {
        return this.child_process !== null
    }

    public get_pid(): number {
        return this.process.pid
    }

    public async start(): Promise<void> {
        const {promise, resolve, reject} = new_promise<string>()
        const child_process = this.spawn()
        const timeout_id = setTimeout(on_timeout, this.timeout_ms)

        function on_timeout(): void {
            reject(new ChildProcessFacadeError('Timeout'))
        }

        function on_data(data: string | Buffer): void {
            resolve(data.toString())
        }

        function on_error(error: Error): void {
            child_process.once('exit', () =>
                reject(new ChildProcessFacadeError(`Unexpected error: ${error.message}`))
            )
            child_process.kill()
        }

        child_process.stdout.on('error', on_error)
        child_process.stdout.on('data', on_data)

        await promise
            .tap(() => (this.child_process = child_process)) // eslint-disable-line no-return-assign
            .tapCatch((_error: Error) => child_process.kill())
            .finally(() => {
                clearTimeout(timeout_id)
                child_process.stdout.off('error', on_error)
                child_process.stdout.off('data', on_data)
            })

        // If this promise resolves, the child process was successfully started. Unfortunately,
        // this doesn't necessarily mean the http server itself is running. If something goes
        // wrong (e.g., because it could not be bound to the requested port) it will only report
        // so in its output but not terminate the process.
        await this.wait_for_port()
    }

    private async wait_for_port(): Promise<void> {
        const is_open = await wait_port({
            host: this.vlc_http_connection.hostname,
            port: this.vlc_http_connection.port,
            protocol: 'http',
            interval: 250,
            timeout: 2_500,
            output: 'silent',
        })

        if (!is_open) {
            throw new ChildProcessFacadeError('Timeout while waiting for http server')
        }
    }

    public async stop(): Promise<void> {
        const {promise, resolve} = new_promise()

        this.process.once('close', (_code, _signal) => {
            this.child_process = null
            resolve()
        })
        this.process.kill()

        await promise
    }

    private get process(): ChildProcessWithoutNullStreams {
        if (!this.child_process) {
            throw new ChildProcessFacadeError('Child process not running')
        }

        return this.child_process
    }

    private spawn(): ChildProcessWithoutNullStreams {
        if (this.is_running()) {
            throw new ChildProcessFacadeError('Instance already running')
        }

        const {hostname, port, password} = this.vlc_http_connection
        const args = [
            '--intf',
            'cli',
            '--control',
            'http',
            '--http-host',
            hostname,
            '--http-port',
            String(port),
            '--http-password',
            password,
        ]
        const child_process = this.spawn_fn(this.path, args)
        child_process.stdout.on('readable', child_process.stdout.read)
        child_process.stderr.on('readable', child_process.stderr.read)

        return child_process
    }
}
