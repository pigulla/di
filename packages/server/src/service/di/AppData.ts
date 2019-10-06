import dayjs, {Dayjs} from 'dayjs'
import custom_parse_format from 'dayjs/plugin/customParseFormat'

import {RawUserData, UserType, User} from './User'
import {Channel, RawChannel} from './Channel'
import {ChannelFilter, RawChannelFilter} from './ChannelFilter'

dayjs.extend(custom_parse_format)

export interface RawAppData {
    appVersion: string
    appDeployTime: string
    currentUserType: UserType
    user: RawUserData
    channels: RawChannel[]
    channel_filters: RawChannelFilter[]
}

export class AppData {
    // eslint-disable-next-line no-useless-constructor
    public constructor (
        public readonly app_version: string,
        public readonly app_deploy_time: Dayjs,
        public readonly user: User,
        public readonly channels: Channel[],
        public readonly channel_filters: ChannelFilter[],
    ) {}

    public static from_raw (data: RawAppData): AppData {
        return new AppData(
            data.appVersion,
            dayjs(data.appDeployTime, 'YYYY-MM-DD HH:mm:ss ZZ'),
            User.from_raw(data.currentUserType, data.user),
            data.channels.map(Channel.from_raw),
            data.channel_filters
                .sort((a, b) => a.position - b.position)
                .map(ChannelFilter.from_raw),
        )
    }
}
