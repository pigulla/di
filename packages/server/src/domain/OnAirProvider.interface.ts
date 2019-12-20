import {Subscribable} from 'rxjs'

import {ChannelIdentifier} from './ChannelsProvider.interface'
import {IOnAir} from './di'

export interface IOnAirProvider extends Subscribable<IOnAirProvider> {
    get (identifier: ChannelIdentifier): IOnAir
    get_all (): IOnAir[]
    get_by_channel_key (key: string): IOnAir
    get_by_channel_id (id: number): IOnAir
}
