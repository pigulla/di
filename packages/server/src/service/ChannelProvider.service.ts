import {Inject, Injectable} from '@nestjs/common'

import {AppData, Channel, ChannelFilter} from './di'
import {IAppDataProvider} from './AppDataProvider.interface'
import {ILogger} from './Logger.interface'
import {IChannelProvider, ChannelIdentifier} from './ChannelProvider.interface'

@Injectable()
export class ChannelProvider implements IChannelProvider {
    private readonly app_data_provider: IAppDataProvider
    private readonly logger: ILogger
    private filters: ChannelFilter[] = []
    private channels_by_id: Map<number, Channel> = new Map()
    private channels_by_key: Map<string, Channel> = new Map()
    private filters_by_id: Map<number, ChannelFilter> = new Map()
    private filters_by_key: Map<string, ChannelFilter> = new Map()

    public constructor (
        @Inject('ILogger') logger: ILogger,
        @Inject('IAppDataProvider') app_data_provider: IAppDataProvider,
    ) {
        this.logger = logger.for_service(ChannelProvider.name)
        this.app_data_provider = app_data_provider
        this.app_data_provider.on_update(this.update, this)

        this.logger.log('Service instantiated')
    }

    protected update ({channels, channel_filters}: AppData): void {
        this.logger.verbose('Updating channel information')
        this.logger.debug(`Received ${channels.length} channels and ${channel_filters.length} channel filters`)

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

    public get_filters (): ChannelFilter[] {
        return this.filters.slice()
    }

    public channel_exists (identifier: ChannelIdentifier): boolean {
        if (typeof identifier === 'string') {
            return this.channels_by_key.has(identifier)
        } else if (typeof identifier === 'number') {
            return this.channels_by_id.has(identifier)
        } else {
            return [...this.channels_by_id.values()].indexOf(identifier) !== -1
        }
    }

    public get (identifier: ChannelIdentifier): Channel {
        if (typeof identifier === 'string') {
            return this.get_by_key(identifier)
        } else if (typeof identifier === 'number') {
            return this.get_by_id(identifier)
        } else {
            return this.get_by_id(identifier.id)
        }
    }

    public get_by_id (id: number): Channel {
        const channel = this.channels_by_id.get(id)

        if (!channel) {
            throw new Error(`Channel with id ${id} not found`)
        }

        return channel
    }

    public get_by_key (key: string): Channel {
        const channel = this.channels_by_key.get(key)

        if (!channel) {
            throw new Error(`Channel with key "${key}" not found`)
        }

        return channel
    }

    public get_all (): Channel[] {
        return [...this.channels_by_id.values()]
    }
}
