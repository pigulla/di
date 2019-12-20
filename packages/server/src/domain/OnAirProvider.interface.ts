import {Subscribable} from 'rxjs'

import {ChannelIdentifier} from './ChannelsProvider.interface'
import {INowPlaying} from './di'

export interface IOnAirProvider extends Subscribable<IOnAirProvider> {
    get (identifier: ChannelIdentifier): INowPlaying
    get_all (): INowPlaying[]
    get_by_channel_key (key: string): INowPlaying
    get_by_channel_id (id: number): INowPlaying
}
