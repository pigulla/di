import {Dayjs} from 'dayjs'
import {Subscribable} from 'rxjs'

import {AppData} from './di'

export interface IAppDataProvider extends Subscribable<AppData> {
    get_app_data(): AppData
    last_updated_at(): Dayjs
}
