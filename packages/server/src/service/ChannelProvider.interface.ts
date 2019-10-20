import {Channel, ChannelFilter} from './di'

export interface IChannelProvider {
    channel_exists (identifier: ChannelIdentifier): boolean
    get (identifier: ChannelIdentifier): Channel
    get_by_id (id: number): Channel
    get_by_key (key: string): Channel
    get_all (): Channel[]
    get_filters (): ChannelFilter[]
}

export type ChannelIdentifier = string|number|Channel;
