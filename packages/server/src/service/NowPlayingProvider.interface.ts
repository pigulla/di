import {ChannelIdentifier} from './ChannelsProvider.interface'
import {NowPlaying} from './di'

export interface INowPlayingProvider {
    update (data: NowPlaying[]): void
    get (identifier: ChannelIdentifier): NowPlaying
    get_all (): NowPlaying[]
    get_by_channel_key (key: string): NowPlaying
    get_by_channel_id (id: number): NowPlaying
}
