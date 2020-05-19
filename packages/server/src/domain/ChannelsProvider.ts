import {Inject, Injectable, OnModuleInit} from '@nestjs/common'

import {IAppDataProvider} from './AppDataProvider.interface'
import {IChannelsProvider, ChannelIdentifier} from './ChannelsProvider.interface'
import {AppData, IChannel, IChannelFilter} from './di'
import {ILogger} from './Logger.interface'

@Injectable()
export class ChannelsProvider implements IChannelsProvider, OnModuleInit {
    private readonly logger: ILogger
    private readonly app_data_provider: IAppDataProvider
    private filters: IChannelFilter[] = []
    private channels_by_id: Map<number, IChannel> = new Map()
    private channels_by_key: Map<string, IChannel> = new Map()
    private filters_by_id: Map<number, IChannelFilter> = new Map()
    private filters_by_key: Map<string, IChannelFilter> = new Map()

    public constructor(
        @Inject('ILogger') logger: ILogger,
        @Inject('IAppDataProvider') app_data_provider: IAppDataProvider
    ) {
        this.logger = logger.child_for_service(ChannelsProvider.name)
        this.app_data_provider = app_data_provider

        this.app_data_provider.subscribe(this.on_new_app_data.bind(this))

        this.logger.debug('Service instantiated')
    }

    public onModuleInit(): void {
        this.on_new_app_data(this.app_data_provider.get_app_data())
    }

    protected on_new_app_data({channels, channel_filters}: AppData): void {
        this.logger.trace('Updating channel information')
        this.logger.trace(
            `Received ${channels.length} channels and ${channel_filters.length} channel filters`
        )

        this.filters = channel_filters.slice()
        this.channels_by_id = new Map()
        this.channels_by_key = new Map()
        this.filters_by_id = new Map()
        this.filters_by_key = new Map()

        for (const channel of channels) {
            this.channels_by_id.set(channel.id, channel)
            this.channels_by_key.set(channel.key, channel)
        }
        for (const filter of channel_filters) {
            this.filters_by_id.set(filter.id, filter)
            this.filters_by_key.set(filter.key, filter)
        }
    }

    public get_filters(): IChannelFilter[] {
        return this.filters.slice()
    }

    public channel_exists(identifier: ChannelIdentifier): boolean {
        if (typeof identifier === 'string') {
            return this.channels_by_key.has(identifier)
        } else {
            return this.channels_by_id.has(identifier)
        }
    }

    public get(id: number): IChannel
    public get(key: string): IChannel
    public get(identifier: ChannelIdentifier): IChannel {
        let channel: IChannel | undefined

        if (typeof identifier === 'string') {
            channel = this.channels_by_key.get(identifier)
        } else {
            channel = this.channels_by_id.get(identifier)
        }

        if (!channel) {
            throw new Error(`Channel "${identifier}" not found`)
        }

        return channel
    }

    public get_all(): IChannel[] {
        return [...this.channels_by_id.values()]
    }
}
