import {ChannelIdentifier} from './ChannelsProvider.interface'
import {INowPlaying} from './di'

export interface INowPlayingProvider {
    update (data: INowPlaying[]): void
    get (identifier: ChannelIdentifier): INowPlaying
    get_all (): INowPlaying[]
    get_by_channel_key (key: string): INowPlaying
    get_by_channel_id (id: number): INowPlaying
}
