import {JsonObject} from 'type-fest'

export interface IPlaybackControl {
    get_current_channel_key(): Promise<string | null>
    get_pid(): number
    get_playback_backend_information(): Promise<JsonObject>
    get_volume(): Promise<number>
    is_playing(): Promise<boolean>
    play(url: string): Promise<void>
    set_volume(volume: number): Promise<void>
    stop(): Promise<void>
}
