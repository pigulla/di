import {EOL} from 'os'
import {ChildProcessWithoutNullStreams, spawn} from 'child_process'

import {Injectable, OnModuleInit, OnApplicationShutdown, Inject} from '@nestjs/common'

import {new_promise, try_resolve} from '../promise_helper'
import {Add, Help, Info, GetVolume, SetVolume, GetVars, Stop, IsPlaying, Play, Shutdown, Status, GetTime, GetTitle} from './vlc/commands'
import {VlcCommand, VlcControlError} from './vlc/'
import {StatusData} from './vlc/commands/Status'
import {TrackInfo} from './vlc/commands/Info'
import {ILogger} from './Logger.interface'
import {IConfigProvider} from './ConfigProvider.interface'
import {IVlcControl, UnknownCommandError} from './VlcControl.interface'

@Injectable()
export class VlcControl implements IVlcControl, OnModuleInit, OnApplicationShutdown {
    private readonly logger: ILogger;

    // A custom prompt is set to make parsing the response a little easier.
    private static readonly prompt: string = '###';

    // A custom welcome message is set to make verifying the other end is actually a VLC instance a little easier.
    private readonly welcome_message: string = Math.random().toString(36).slice(2);

    private readonly config_provider: IConfigProvider;
    private vlc_process: ChildProcessWithoutNullStreams|null;
    private vlc_version: string|null;

    public constructor (
        @Inject('ILogger') logger: ILogger,
        @Inject('IConfigProvider') config_provider: IConfigProvider,
    ) {
        this.logger = logger.for_service(VlcControl.name)
        this.config_provider = config_provider
        this.vlc_process = null
        this.vlc_version = null

        this.logger.log('Service instantiated')
    }

    public async onModuleInit (): Promise<void> {
        await this.start_instance()
    }

    public async onApplicationShutdown (_signal?: string): Promise<void> {
        await this.stop_instance()
    }

    public static split_lines (data: string|Buffer): string[] {
        return data.toString().split(/\r?\n/).filter(line => line.length > 0)
    }

    private parse_initial_response (response: string): string {
        const lines = VlcControl.split_lines(response)
        const version_matches = /^VLC media player (\d+(?:.\d+)+)\s/.exec(lines[0])

        if (lines.length !== 3) {
            throw new VlcControlError('Unexpected response length')
        } else if (!version_matches) {
            throw new VlcControlError('Unexpected version string')
        } else if (lines[1] !== this.welcome_message) {
            throw new VlcControlError('Unexpected welcome message')
        } else if (lines[2] !== VlcControl.prompt) {
            throw new VlcControlError('Unexpected prompt')
        }

        return version_matches[1]
    }

    private spawn_vlc (path: string): ChildProcessWithoutNullStreams {
        const args = [
            '--intf',
            'cli',
            '--lua-config',
            `cli={prompt="${VlcControl.prompt}",welcome="${this.welcome_message}",width=240}`,
        ]
        const vlc = spawn(path, args)

        vlc.stdout.on('readable', vlc.stdout.read)
        vlc.stderr.on('readable', vlc.stderr.read)
        vlc.once('close', this.on_vlc_close.bind(this))

        this.logger.verbose(`VLC spawned with pid ${vlc.pid}`)
        return vlc
    }

    private on_vlc_close (code: number, _signal: string): void {
        if (code === 0) {
            // The process did not exit on its own
            this.logger.error('VLC instance exited prematurely')
        }

        this.vlc_process = null
        this.vlc_version = null
    }

    public is_running (): boolean {
        return !!this.vlc_process
    }

    public get_vlc_version (): string {
        if (this.vlc_version === null) {
            throw new Error('Version not available')
        }

        return this.vlc_version
    }

    public get_vlc_pid (): number {
        if (this.vlc_process === null) {
            throw new Error('VLC not running')
        }

        return this.vlc_process.pid
    }

    public async start_instance (): Promise<void> {
        if (this.vlc_process) {
            throw new VlcControlError('Instance already running')
        }

        const {promise, resolve, reject} = new_promise<string>()
        const {vlc_path, vlc_timeout, vlc_initial_volume} = this.config_provider
        const vlc = this.spawn_vlc(vlc_path)
        const timeout_id = setTimeout(() => reject(new VlcControlError('Timeout')), vlc_timeout)

        const on_error = (error: Error): void => {
            vlc.once('exit', () => reject(new VlcControlError('Unexpected error', error)))
            vlc.kill()
        }

        const on_data = (data: string|Buffer): void => {
            const string = data.toString()
            try_resolve<string>(() => this.parse_initial_response(string), resolve, reject)
        }

        vlc.stdout.on('error', on_error)
        vlc.stdout.on('data', on_data)

        await promise
            .tap(version => this.vlc_version = version) // eslint-disable-line no-return-assign
            .tap(() => this.vlc_process = vlc) // eslint-disable-line no-return-assign
            .tapCatch(_error => vlc.kill())
            .finally(() => {
                clearTimeout(timeout_id)
                vlc.stdout
                    .off('error', on_error)
                    .off('data', on_data)
            })

        if (vlc_initial_volume !== null) {
            await this.set_volume(vlc_initial_volume)
        }
    }

    public stop_instance (): Promise<void> {
        this.logger.verbose('Stopping VLC instance')

        const {promise, resolve} = new_promise<void>()
        this.vlc.once('close', (_code, _signal) => resolve())
        this.vlc.kill()

        return promise
    }

    private get vlc (): ChildProcessWithoutNullStreams {
        if (!this.vlc_process) {
            throw new Error('Not connected')
        }

        return this.vlc_process
    }

    private send (command: string, args: string): Promise<string[]> {
        this.logger.debug(`Sending command ${command}(${args})`)

        const {promise, resolve, reject} = new_promise<string[]>()

        this.vlc.stdout.once('data', function (data) {
            const lines = VlcControl.split_lines(data)
            const count = lines.length

            if (count === 0) {
                return reject(new VlcControlError('Response too short'))
            } else if (lines[count - 1] !== VlcControl.prompt) {
                return reject(new VlcControlError('Unexpected prompt'))
            } else if (count === 3 && lines[0].match(/^Error/) && lines[1].match(/^Unknown command/)) {
                return reject(new UnknownCommandError(command))
            }

            resolve(lines.slice(0, -1))
        })
        this.vlc.stdin.write(command + (args.length === 0 ? '' : ` ${args}`) + EOL)

        return promise
    }

    private async exec_command<Command extends VlcCommand<any, any>> (
        Ctor: new () => Command,
        ...params: Parameters<Command['build_arg_string']>
    ): Promise<ReturnType<Command['parse']>> {
        const command = new Ctor()
        const args_string = command.build_arg_string(params)
        const result = await this.send(command.command, args_string)

        return command.parse(result)
    }

    public async get_time (): Promise<number> {
        return this.exec_command(GetTime, [])
    }

    public async get_title (): Promise<string> {
        return this.exec_command(GetTitle, [])
    }

    public async status (): Promise<StatusData> {
        return this.exec_command(Status, [])
    }

    public async is_playing (): Promise<boolean> {
        return this.exec_command(IsPlaying, [])
    }

    public async help (): Promise<string[]> {
        return this.exec_command(Help, [])
    }

    public async shutdown (): Promise<void> {
        return this.exec_command(Shutdown, [])
    }

    public async add (item: string): Promise<void> {
        return this.exec_command(Add, [item])
    }

    public async play (): Promise<void> {
        return this.exec_command(Play, [])
    }

    public async info (): Promise<TrackInfo|null> {
        return this.exec_command(Info, [])
    }

    public async get_volume (): Promise<number> {
        return this.exec_command(GetVolume, [])
    }

    public async set_volume (volume: number): Promise<void> {
        return this.exec_command(SetVolume, [volume])
    }

    public async get_vars (): Promise<Map<string, string>> {
        return this.exec_command(GetVars, [])
    }

    public async stop (): Promise<void> {
        return this.exec_command(Stop, [])
    }
}
