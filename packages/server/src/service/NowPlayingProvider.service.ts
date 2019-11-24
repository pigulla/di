import {Inject, Injectable} from '@nestjs/common'

import {ChannelIdentifier} from './ChannelProvider.interface'
import {NowPlaying} from './di'
import {ILogger} from './logger'
import {INowPlayingProvider} from './NowPlayingProvider.interface'

@Injectable()
export class NowPlayingProvider implements INowPlayingProvider {
    private readonly logger: ILogger
    private readonly by_id: Map<number, NowPlaying> = new Map()
    private readonly by_key: Map<string, NowPlaying> = new Map()

    public constructor (
        @Inject('ILogger') logger: ILogger,
    ) {
        this.logger = logger.child_for_service(NowPlayingProvider.name)

        this.logger.debug('Service instantiated')
    }

    public update (data: NowPlaying[]): void {
        this.logger.debug('Updating "now playing" information')

        this.by_id.clear()
        this.by_key.clear()

        for (const now_playing of data) {
            this.by_id.set(now_playing.channel_id, now_playing)
            this.by_key.set(now_playing.channel_key, now_playing)
        }
    }

    public get (identifier: ChannelIdentifier): NowPlaying {
        if (typeof identifier === 'string') {
            return this.get_by_channel_key(identifier)
        } else if (typeof identifier === 'number') {
            return this.get_by_channel_id(identifier)
        } else {
            return this.get_by_channel_id(identifier.id)
        }
    }

    public get_by_channel_id (id: number): NowPlaying {
        const channel = this.by_id.get(id)

        if (!channel) {
            throw new Error(`Channel with id ${id} not found`)
        }

        return channel
    }

    public get_by_channel_key (key: string): NowPlaying {
        const channel = this.by_key.get(key)

        if (!channel) {
            throw new Error(`Channel with key "${key}" not found`)
        }

        return channel
    }

    public get_all (): NowPlaying[] {
        return [...this.by_id.values()]
    }
}
