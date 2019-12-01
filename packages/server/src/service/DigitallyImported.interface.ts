import {AppData, NowPlaying} from './di'

export interface Credentials {
    username: string
    password: string
}

export interface IDigitallyImported {
    load_app_data (): Promise<AppData>
    load_now_playing (): Promise<NowPlaying[]>
    load_favorite_channel_keys (credentials: Credentials): Promise<string[]>
}
