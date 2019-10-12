import {StatusData} from './vlc/commands/Status'
import {TrackInfo} from './vlc/commands/Info'

export class UnknownCommandError extends Error {
    public constructor (command: string) {
        super(`Unknown command "${command}"`)
    }
}

export interface IVlcControl {
    get_vlc_version (): string
    get_vlc_pid (): number
    is_running (): boolean

    start_instance (): Promise<void>
    stop_instance (): Promise<void>
    get_time (): Promise<number>
    get_title (): Promise<string>
    status (): Promise<StatusData>
    is_playing (): Promise<boolean>
    help (): Promise<string[]>
    shutdown (): Promise<void>
    add (item: string): Promise<void>
    play (): Promise<void>
    info (): Promise<TrackInfo|null>
    get_volume (): Promise<number>
    set_volume (volume: number): Promise<void>
    get_vars (): Promise<Map<string, string>>
    stop (): Promise<void>
}
