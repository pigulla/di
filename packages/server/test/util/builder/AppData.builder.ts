import dayjs, {Dayjs} from 'dayjs'

import {AppData} from '~src/domain/di'
import {Channel, ChannelFilter} from '~src/infrastructure/di'

export class AppDataBuilder {
    private app_version: string = '1.23.45'
    private app_deploy_time: Dayjs = dayjs('2019-05-19T06:00:00.000Z')
    private channels: Channel[] = []
    private channel_filters: ChannelFilter[] = []

    public with_app_version(app_version: string): this {
        this.app_version = app_version
        return this
    }

    public with_app_deploy_time(app_deploy_time: dayjs.ConfigType): this {
        this.app_deploy_time = dayjs(app_deploy_time)
        return this
    }

    public with_channels(channels: Channel[]): this {
        this.channels = channels
        return this
    }

    public with_channel_filters(channel_filters: ChannelFilter[]): this {
        this.channel_filters = channel_filters
        return this
    }

    public build(): AppData {
        return {
            app_version: this.app_version,
            app_deploy_time: this.app_deploy_time,
            channels: this.channels,
            channel_filters: this.channel_filters,
        }
    }
}
