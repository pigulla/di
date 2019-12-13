import {AppData, INowPlaying} from './di'

export interface Credentials {
    username: string
    password: string
}

export interface IDigitallyImported {
    load_app_data (): Promise<AppData>
    load_now_playing (): Promise<INowPlaying[]>
    load_favorite_channel_keys (credentials: Credentials): Promise<string[]>
}
