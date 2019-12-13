import {Inject, Injectable} from '@nestjs/common'
import crypto from 'crypto'

import {INowPlaying} from './di'
import {ChannelIdentifier} from './ChannelsProvider.interface'
import {ILogger} from './Logger.interface'
import {INowPlayingProvider} from './NowPlayingProvider.interface'

export function hash_now_playing (now_playing: INowPlaying): string {
    const input = JSON.stringify(now_playing.to_dto())

    return crypto
        .createHash('md5')
        .update(input, 'utf8')
        .digest('hex')
}

@Injectable()
export class NowPlayingProvider implements INowPlayingProvider {
    private readonly logger: ILogger
    private readonly by_id: Map<number, INowPlaying> = new Map()
    private readonly by_key: Map<string, INowPlaying> = new Map()

    public constructor (
        @Inject('ILogger') logger: ILogger,
    ) {
        this.logger = logger.child_for_service(NowPlayingProvider.name)

        this.logger.debug('Service instantiated')
    }

    public update (data: INowPlaying[]): void {
        this.logger.trace('Updating "now playing" information')

        this.by_id.clear()
        this.by_key.clear()

        for (const now_playing of data) {
            this.by_id.set(now_playing.channel_id, now_playing)
            this.by_key.set(now_playing.channel_key, now_playing)
        }
    }

    public get (identifier: ChannelIdentifier): INowPlaying {
        if (typeof identifier === 'string') {
            return this.get_by_channel_key(identifier)
        } else {
            return this.get_by_channel_id(identifier)
        }
    }

    public get_by_channel_id (id: number): INowPlaying {
        const now_playing = this.by_id.get(id)

        if (!now_playing) {
            throw new Error(`No data for channel with id ${id} found`)
        }

        return now_playing
    }

    public get_by_channel_key (key: string): INowPlaying {
        const now_playing = this.by_key.get(key)

        if (!now_playing) {
            throw new Error(`No data for channel with key "${key}" found`)
        }

        return now_playing
    }

    public get_all (): INowPlaying[] {
        return [...this.by_id.values()]
    }
}
