import {AppData} from './di'

export interface Credentials {
    email: string
    password: string
}

export interface IDigitallyImported {
    load_app_data (): Promise<AppData>
}
