import {Inject, Injectable} from '@nestjs/common'
import crypto from 'crypto'

import {ChannelIdentifier} from './ChannelsProvider.interface'
import {INowPlayingProvider} from './NowPlayingProvider.interface'
import {NowPlaying} from './di'
import {ILogger} from './logger'

export function hash_now_playing (now_playing: NowPlaying): string {
    const input = JSON.stringify(now_playing.to_dto())

    return crypto
        .createHash('md5')
        .update(input, 'utf8')
        .digest('hex')
}

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
        } else {
            return this.get_by_channel_id(identifier)
        }
    }

    public get_by_channel_id (id: number): NowPlaying {
        const now_playing = this.by_id.get(id)

        if (!now_playing) {
            throw new Error(`No data for channel with id ${id} found`)
        }

        return now_playing
    }

    public get_by_channel_key (key: string): NowPlaying {
        const now_playing = this.by_key.get(key)

        if (!now_playing) {
            throw new Error(`No data for channel with key "${key}" found`)
        }

        return now_playing
    }

    public get_all (): NowPlaying[] {
        return [...this.by_id.values()]
    }
}
