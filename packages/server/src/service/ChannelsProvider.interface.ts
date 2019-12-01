import {Channel, ChannelFilter} from './di'

export type ChannelIdentifier = string|number

export interface IChannelsProvider {
    channel_exists (identifier: ChannelIdentifier): boolean
    get (id: number): Channel
    get (key: string): Channel
    get (identifier: ChannelIdentifier): Channel
    get_all (): Channel[]
    get_filters (): ChannelFilter[]
}
