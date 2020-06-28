import dayjs, {Dayjs} from 'dayjs'
import custom_parse_format from 'dayjs/plugin/customParseFormat'

import {Channel, RawChannel} from './Channel'
import {ChannelFilter, RawChannelFilter} from './ChannelFilter'

dayjs.extend(custom_parse_format)

export interface RawAppData {
    appVersion: string
    appDeployTime: string
    channels: RawChannel[]
    channel_filters: RawChannelFilter[]
}

export class AppData {
    // eslint-disable-next-line no-useless-constructor
    public constructor(
        public readonly app_version: string,
        public readonly app_deploy_time: Dayjs,
        public readonly channels: Channel[],
        public readonly channel_filters: ChannelFilter[]
    ) {}

    public static from_raw(data: RawAppData): AppData {
        const app_deploy_time_format = 'YYYY-MM-DD[T]HH:mm:ssZ'
        const app_deploy_yime = dayjs(data.appDeployTime, app_deploy_time_format)

        if (!app_deploy_yime.isValid()) {
            throw new Error(`Failed to parse appDeployTime (string "${data.appDeployTime}" did not match format "${app_deploy_time_format}")`)
        }

        return new AppData(
            data.appVersion,
            app_deploy_yime,
            data.channels.map(Channel.from_raw),
            data.channel_filters.sort((a, b) => a.position - b.position).map(ChannelFilter.from_raw)
        )
    }
}
