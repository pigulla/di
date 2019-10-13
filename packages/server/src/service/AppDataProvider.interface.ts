import {Dayjs} from 'dayjs'
import {AppData} from './di'

export type UpdateCallback<T> = (value: T) => void;

export interface UpdateNotifier<T> {
    on_update (callback: UpdateCallback<T>, context?: any): void
}

export interface IAppDataProvider extends UpdateNotifier<AppData> {
    load_app_data (): Promise<IAppDataProvider>
    get_app_data (): AppData
    last_updated_at (): Dayjs
}
