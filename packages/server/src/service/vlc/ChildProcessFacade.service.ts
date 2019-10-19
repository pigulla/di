import {EOL} from 'os'
import {ChildProcessWithoutNullStreams, spawn} from 'child_process'

import {new_promise} from '../../promise_helper'
import {ILogger} from '../Logger.interface'
import {IChildProcessFacade} from './ChildProcessFacade.interface'
import {Inject} from '@nestjs/common'
import {IConfigProvider} from '../ConfigProvider.interface'

export type Options = {
    logger: ILogger
    path: string
    args: string[]
    timeout_ms: number
}

export class ChildProcessFacade implements IChildProcessFacade {
    private readonly logger: ILogger
    private readonly path: string
    private readonly timeout_ms: number
    private child_process: ChildProcessWithoutNullStreams|null

    public constructor (
        @Inject('ILogger') logger: ILogger,
        @Inject('IConfigProvider') config_provider: IConfigProvider,
    ) {
        this.logger = logger.for_service(ChildProcessFacade.name)
        this.path = config_provider.vlc_path
        this.timeout_ms = config_provider.vlc_timeout
        this.child_process = null

        this.logger.log('Service instantiated')
    }

    public is_running (): boolean {
        return this.child_process !== null
    }

    public get_pid (): number {
        return this.process.pid
    }

    private get process (): ChildProcessWithoutNullStreams {
        if (!this.child_process) {
            throw new Error('Child process not running')
        }

        return this.child_process
    }

    private spawn (prompt: string, welcome_message: string): ChildProcessWithoutNullStreams {
        if (this.is_running()) {
            throw new Error('Instance already running')
        }

        const args = [
            '--intf',
            'cli',
            '--lua-config',
            `cli={prompt="${prompt}",welcome="${welcome_message}",width=240}`,
        ]
        const child_process = spawn(this.path, args)

        child_process.stdout.on('readable', child_process.stdout.read)
        child_process.stderr.on('readable', child_process.stderr.read)
        child_process.once('close', (code: number, _signal: string) => {
            if (code === 0) {
                // The process did not exit on its own
                this.logger.error('Child process exited prematurely')
            }
        })

        this.logger.verbose(`Child process spawned with pid ${child_process.pid}`)
        return child_process
    }

    public async start (prompt: string, welcome_message: string): Promise<string> {
        const {promise, resolve, reject} = new_promise<string>()
        const child_process = this.spawn(prompt, welcome_message)

        const timeout_id = setTimeout(() => reject(new Error('Timeout')), this.timeout_ms)

        const on_data = (data: string|Buffer): void => resolve(data.toString())
        const on_error = (error: Error): void => {
            child_process.once('exit', () => reject(new Error(`Unexpected error: ${error.message}`)))
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

    public stop (): Promise<void> {
        this.logger.verbose('Stopping child process')

        const {promise, resolve} = new_promise<void>()
        this.process.once('close', (_code, _signal) => resolve())
        this.process.kill()

        return promise
    }

    public send (command: string, args: string): Promise<string> {
        this.logger.debug(`Sending command ${command}(${args})`)

        const {promise, resolve} = new_promise<string>()

        this.process.stdout.once('data', resolve)
        this.process.stdin.write(command + (args.length === 0 ? '' : ` ${args}`) + EOL)

        return promise
    }
}
