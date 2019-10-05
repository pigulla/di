import {EOL} from 'os'
import {ChildProcessWithoutNullStreams, SpawnOptionsWithoutStdio} from 'child_process'

import {new_promise} from '@server/new_promise'
import {IChildProcessFacade} from './ChildProcessFacade.interface'

export type SpawnFn =
    (command: string, args?: string[], options?: SpawnOptionsWithoutStdio) => ChildProcessWithoutNullStreams

export class ChildProcessFacadeError extends Error {}

export class ChildProcessFacade implements IChildProcessFacade {
    private readonly path: string
    private readonly timeout_ms: number
    private readonly spawn_fn: SpawnFn
    private child_process: ChildProcessWithoutNullStreams|null

    public constructor (
        path: string,
        timeout_ms: number,
        spawn_fn: SpawnFn,
    ) {
        this.path = path
        this.timeout_ms = timeout_ms
        this.child_process = null
        this.spawn_fn = spawn_fn
    }

    public is_running (): boolean {
        return this.child_process !== null
    }

    public get_pid (): number {
        return this.process.pid
    }

    public async start (prompt: string, welcome_message: string): Promise<string> {
        const {promise, resolve, reject} = new_promise<string>()
        const child_process = this.spawn(prompt, welcome_message)

        const timeout_id = setTimeout(() => reject(new ChildProcessFacadeError('Timeout')), this.timeout_ms)

        const on_data = (data: string|Buffer): void => resolve(data.toString())
        const on_error = (error: Error): void => {
            child_process.once('exit', () => reject(new ChildProcessFacadeError(`Unexpected error: ${error.message}`)))
            child_process.kill()
        }

        child_process.stdout.on('error', on_error)
        child_process.stdout.on('data', on_data)

        const version = await promise
            .tap(() => this.child_process = child_process) // eslint-disable-line no-return-assign
            .tapCatch((_error: Error) => child_process.kill())
            .finally(() => {
                clearTimeout(timeout_id)
                child_process.stdout.off('error', on_error)
                child_process.stdout.off('data', on_data)
            })

        return version
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

    public async send (command: string, args: string = ''): Promise<string> {
        const {promise, resolve} = new_promise<string>()
        const command_str = command + (args.length === 0 ? '' : ` ${args}`) + EOL

        this.process.stdout.once('data', resolve)
        this.process.stdin.write(command_str)

        return promise
    }

    private get process (): ChildProcessWithoutNullStreams {
        if (!this.child_process) {
            throw new ChildProcessFacadeError('Child process not running')
        }

        return this.child_process
    }

    private spawn (prompt: string, welcome_message: string): ChildProcessWithoutNullStreams {
        if (this.is_running()) {
            throw new ChildProcessFacadeError('Instance already running')
        }

        const args = [
            '--intf',
            'cli',
            '--lua-config',
            `cli={prompt="${prompt}",welcome="${welcome_message}",width=240}`,
        ]
        const child_process = this.spawn_fn(this.path, args)

        child_process.stdout.on('readable', child_process.stdout.read)
        child_process.stderr.on('readable', child_process.stderr.read)

        return child_process
    }
}
