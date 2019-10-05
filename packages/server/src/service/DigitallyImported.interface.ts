import {AppData, NowPlaying} from './di'

export interface IDigitallyImported {
    load_app_data (): Promise<AppData>
    load_now_playing (): Promise<NowPlaying[]>
}
