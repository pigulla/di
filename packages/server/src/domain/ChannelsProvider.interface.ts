import {IChannel, IChannelFilter} from './di'

export type ChannelIdentifier = string | number

export interface IChannelsProvider {
    channel_exists(identifier: ChannelIdentifier): boolean
    get(id: number): IChannel
    get(key: string): IChannel
    get(identifier: ChannelIdentifier): IChannel
    get_all(): IChannel[]
    get_filters(): IChannelFilter[]
}
