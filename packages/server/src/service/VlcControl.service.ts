import {Injectable, OnModuleInit, OnApplicationShutdown, Inject} from '@nestjs/common'

import * as vlc_commands from './vlc/commands'
import {VlcCommand, VlcControlError, IChildProcessFacade} from './vlc'
import {ILogger} from './Logger.interface'
import {IConfigProvider} from './ConfigProvider.interface'
import {IVlcControl, UnknownCommandError} from './VlcControl.interface'
import {StatusData} from './vlc/commands/Status'
import {TrackInfo} from './vlc/commands/Info'

@Injectable()
export class VlcControl implements IVlcControl, OnModuleInit, OnApplicationShutdown {
    private readonly logger: ILogger;

    // A custom prompt is set to make parsing the response a little easier.
    private static readonly prompt: string = '###';

    // A custom welcome message is set to make verifying the other end is actually a VLC instance a little easier.
    private readonly welcome_message: string = Math.random().toString(36).slice(2);

    private readonly config_provider: IConfigProvider;
    private vlc_process: IChildProcessFacade
    private vlc_version: string|null;

    public constructor (
        @Inject('ILogger') logger: ILogger,
        @Inject('IConfigProvider') config_provider: IConfigProvider,
        @Inject('IChildProcessFacade') child_process_facade: IChildProcessFacade,
    ) {
        this.logger = logger.for_service(VlcControl.name)
        this.config_provider = config_provider
        this.vlc_version = null
        this.vlc_process = child_process_facade

        this.logger.log('Service instantiated')
    }

    public async onModuleInit (): Promise<void> {
        await this.start_instance()
    }

    public async onApplicationShutdown (_signal?: string): Promise<void> {
        await this.stop_instance()
    }

    public is_running (): boolean {
        return this.vlc_process.is_running()
    }

    public get_vlc_version (): string {
        if (this.vlc_version === null) {
            throw new Error('Version not yet available')
        }

        return this.vlc_version
    }

    public get_vlc_pid (): number {
        return this.vlc_process.get_pid()
    }

    public async start_instance (): Promise<void> {
        const response = await this.vlc_process.start(VlcControl.prompt, this.welcome_message)
        this.vlc_version = this.parse_version_from_initial_response(response)

        if (this.config_provider.vlc_initial_volume !== null) {
            await this.set_volume(this.config_provider.vlc_initial_volume)
        }
    }

    public async stop_instance (): Promise<void> {
        await this.vlc_process.stop()
    }

    private static split_lines (data: string|Buffer): string[] {
        return data.toString().split(/\r?\n/).filter(line => line.length > 0)
    }

    private parse_version_from_initial_response (response: string): string {
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

    private async send (command: string, args: string): Promise<string[]> {
        this.logger.debug(`Sending command ${command}(${args})`)

        const data = await this.vlc_process.send(command, args)
        const lines = VlcControl.split_lines(data)
        const count = lines.length

        if (count === 0) {
            throw new VlcControlError('Response too short')
        } else if (lines[count - 1] !== VlcControl.prompt) {
            throw new VlcControlError('Unexpected prompt')
        } else if (count === 3 && lines[0].match(/^Error/) && lines[1].match(/^Unknown command/)) {
            throw new UnknownCommandError(command)
        }

        return lines.slice(0, -1)
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
        return this.exec_command(vlc_commands.GetTime, [])
    }

    public async get_title (): Promise<string> {
        return this.exec_command(vlc_commands.GetTitle, [])
    }

    public async status (): Promise<StatusData> {
        return this.exec_command(vlc_commands.Status, [])
    }

    public async is_playing (): Promise<boolean> {
        return this.exec_command(vlc_commands.IsPlaying, [])
    }

    public async help (): Promise<string[]> {
        return this.exec_command(vlc_commands.Help, [])
    }

    public async shutdown (): Promise<void> {
        return this.exec_command(vlc_commands.Shutdown, [])
    }

    public async add (item: string): Promise<void> {
        return this.exec_command(vlc_commands.Add, [item])
    }

    public async play (): Promise<void> {
        return this.exec_command(vlc_commands.Play, [])
    }

    public async info (): Promise<TrackInfo|null> {
        return this.exec_command(vlc_commands.Info, [])
    }

    public async get_volume (): Promise<number> {
        return this.exec_command(vlc_commands.GetVolume, [])
    }

    public async set_volume (volume: number): Promise<void> {
        return this.exec_command(vlc_commands.SetVolume, [volume])
    }

    public async get_vars (): Promise<Map<string, string>> {
        return this.exec_command(vlc_commands.GetVars, [])
    }

    public async stop (): Promise<void> {
        return this.exec_command(vlc_commands.Stop, [])
    }
}
