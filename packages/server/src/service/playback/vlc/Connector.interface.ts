import {StatusData} from '@server/service/playback/vlc/commands/Status'

export interface IConnector {
    add (item: string): Promise<void>
    get_status (): Promise<StatusData>
    get_vlc_pid (): number
    get_vlc_version (): string
    get_volume (): Promise<number>
    is_playing (): Promise<boolean>
    is_running (): boolean
    play (): Promise<void>
    set_volume (volume: number): Promise<void>
    shutdown (): Promise<void>
    start_instance (initial_volume: number|null): Promise<void>
    stop (): Promise<void>
    stop_instance (): Promise<void>
}
