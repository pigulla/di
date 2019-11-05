import {randomBytes} from 'crypto'

import {IChildProcessFacade} from './ChildProcessFacade.interface'
import {ControlError} from './ControlError'
import {Command} from './Command'
import * as vlc_commands from './commands'
import {IConnector} from './Connector.interface'
import {StatusData} from './commands/Status'

export class Connector implements IConnector {
    // A custom prompt is set to make parsing the response a little easier.
    public static readonly prompt: string = '###';

    // A custom welcome message is set to make verifying the other end is actually a VLC instance a little easier.
    private readonly welcome_message: string = randomBytes(8).toString('hex')

    private process: IChildProcessFacade
    private vlc_version: string|null;

    public constructor (child_process_facade: IChildProcessFacade) {
        this.process = child_process_facade
        this.vlc_version = null
    }

    public is_running (): boolean {
        return this.process.is_running()
    }

    public get_vlc_version (): string {
        if (this.vlc_version === null) {
            throw new Error('Version not yet available')
        }

        return this.vlc_version
    }

    public get_vlc_pid (): number {
        return this.process.get_pid()
    }

    public async start_instance (initial_volume: number|null): Promise<void> {
        const response = await this.process.start(Connector.prompt, this.welcome_message)
        this.vlc_version = this.parse_version_from_initial_response(response)

        if (initial_volume !== null) {
            await this.set_volume(initial_volume)
        }
    }

    public async stop_instance (): Promise<void> {
        if (this.process.is_running()) {
            await this.process.stop()
        }
    }

    private static split_lines (data: string|Buffer): string[] {
        return data.toString().split(/\r?\n/).filter(line => line.length > 0)
    }

    private parse_version_from_initial_response (response: string): string {
        const lines = Connector.split_lines(response)
        const version_matches = /^VLC media player (\d+(?:.\d+)+)\s/.exec(lines[0])

        if (lines.length !== 3) {
            throw new ControlError('Unexpected response length')
        } else if (!version_matches) {
            throw new ControlError('Unexpected version string')
        } else if (lines[1] !== this.welcome_message) {
            throw new ControlError('Unexpected welcome message')
        } else if (lines[2] !== Connector.prompt) {
            throw new ControlError('Unexpected prompt')
        }

        return version_matches[1]
    }

    private async send (command: string, args: string): Promise<string[]> {
        const data = await this.process.send(command, args)
        const lines = Connector.split_lines(data)
        const count = lines.length

        if (count === 0) {
            throw new ControlError('Response too short')
        } else if (lines[count - 1] !== Connector.prompt) {
            throw new ControlError('Unexpected prompt')
        } else if (count === 3 && lines[0].match(/^Error/) && lines[1].match(/^Unknown command/)) {
            throw new ControlError(`Unknown command: ${command}`)
        }

        return lines.slice(0, -1)
    }

    private async exec_command<C extends Command<any, any>> (
        Ctor: new () => C,
        ...params: Parameters<C['build_arg_string']>
    ): Promise<ReturnType<C['parse']>> {
        const command = new Ctor()
        const args_string = command.build_arg_string(params)
        const result = await this.send(command.command, args_string)

        return command.parse(result)
    }

    public async shutdown (): Promise<void> {
        return this.exec_command(vlc_commands.Shutdown, [])
    }

    public async add (item: string): Promise<void> {
        return this.exec_command(vlc_commands.Add, [item])
    }

    public async is_playing (): Promise<boolean> {
        return this.exec_command(vlc_commands.IsPlaying, [])
    }

    public async get_status (): Promise<StatusData> {
        return this.exec_command(vlc_commands.Status, [])
    }

    public async play (): Promise<void> {
        return this.exec_command(vlc_commands.Play, [])
    }

    public async get_volume (): Promise<number> {
        return this.exec_command(vlc_commands.GetVolume, [])
    }

    public async set_volume (volume: number): Promise<void> {
        await this.exec_command(vlc_commands.SetVolume, [volume])
    }

    public async stop (): Promise<void> {
        return this.exec_command(vlc_commands.Stop, [])
    }
}
