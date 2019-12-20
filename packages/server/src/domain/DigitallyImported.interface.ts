import {AppData, IOnAir} from './di'

export interface Credentials {
    username: string
    password: string
}

export interface IDigitallyImported {
    load_app_data (): Promise<AppData>
    load_on_air (): Promise<IOnAir[]>
    load_favorite_channel_keys (credentials: Credentials): Promise<string[]>
}
