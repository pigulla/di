import {Dayjs} from 'dayjs'

import {AppData} from './di'
import {IUpdateNotifier} from './UpdateNotifier.interface'

export interface IAppDataProvider extends IUpdateNotifier<AppData> {
    load_app_data (): Promise<IAppDataProvider>
    get_app_data (): AppData
    last_updated_at (): Dayjs
}
