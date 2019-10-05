import {JsonValue} from 'type-fest'

export interface ControlInformation {
    [key: string]: JsonValue
    pid: number
}

export interface IPlaybackControl {
    play (url: string): Promise<void>
    stop (): Promise<void>
    get_current_channel_key (): Promise<string|null>
    is_playing (): Promise<boolean>
    get_volume (): Promise<number>
    set_volume (volume: number): Promise<void>
    get_meta_information (): Promise<ControlInformation>
}
