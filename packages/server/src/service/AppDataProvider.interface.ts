import {Dayjs} from 'dayjs'

import {AppData} from './di'
import {UpdateNotifier} from './UpdateNotifier'

export interface IAppDataProvider extends UpdateNotifier<AppData> {
    load_app_data (): Promise<IAppDataProvider>
    get_app_data (): AppData
    last_updated_at (): Dayjs
}
