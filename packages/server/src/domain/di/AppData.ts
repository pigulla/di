import {Dayjs} from 'dayjs'

import {IChannel} from './Channel.interface'
import {IChannelFilter} from './ChannelFilter.interface'

export interface AppData {
    readonly app_version: string
    readonly app_deploy_time: Dayjs
    readonly channels: IChannel[]
    readonly channel_filters: IChannelFilter[]
}
