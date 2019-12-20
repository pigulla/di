export interface VlcHttpConnection {
    hostname: string
    port: number
    password: string
}

export enum PlaybackState {
    PAUSED = 'paused',
    PLAYING = 'playing',
    STOPPED = 'stopped',
}

export interface Meta {
    filename: string
    genre: string
    title: string
}

export interface Status {
    volume: number
    apiversion: number
    state: PlaybackState
    version: string
    meta: Meta|null
}

export interface IVlcHttpClient {
    get_current_channel_key (): Promise<string|null>
    get_status (): Promise<Status>
    play (url: string): Promise<void>
    stop (): Promise<void>
    adjust_volume_by (volume: number): Promise<void>
    set_volume (volume: number): Promise<void>
    get_volume (): Promise<number>
    is_playing (): Promise<boolean>
}
