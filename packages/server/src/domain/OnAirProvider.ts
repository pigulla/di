import crypto from 'crypto'

import {Inject, Injectable} from '@nestjs/common'
import {Subject} from 'rxjs'

import {INowPlaying} from './di'
import {ChannelIdentifier} from './ChannelsProvider.interface'
import {ILogger} from './Logger.interface'
import {IOnAirProvider} from './OnAirProvider.interface'

export function hash_on_air (on_air: INowPlaying[]): string {
    const input = JSON.stringify(on_air.map(now_playing => now_playing.to_dto()))

    return crypto
        .createHash('md5')
        .update(input, 'utf8')
        .digest('hex')
}

@Injectable()
export class OnAirProvider extends Subject<IOnAirProvider> implements IOnAirProvider {
    private readonly logger: ILogger
    private readonly by_id: Map<number, INowPlaying> = new Map()
    private readonly by_key: Map<string, INowPlaying> = new Map()
    private hash: string

    public constructor (
        @Inject('ILogger') logger: ILogger,
    ) {
        super()

        this.logger = logger.child_for_service(OnAirProvider.name)
        this.hash = ''

        this.logger.debug('Service instantiated')
    }

    public update_with (on_air: INowPlaying[]): void {
        this.logger.trace('Updating data')

        const new_hash = hash_on_air(on_air)

        if (new_hash === this.hash) {
            return
        }

        this.hash = new_hash
        this.by_id.clear()
        this.by_key.clear()

        for (const now_playing of on_air) {
            this.by_id.set(now_playing.channel_id, now_playing)
            this.by_key.set(now_playing.channel_key, now_playing)
        }

        this.next(this)
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
