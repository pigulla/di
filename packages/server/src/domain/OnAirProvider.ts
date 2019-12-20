import crypto from 'crypto'

import {Inject, Injectable, OnModuleInit} from '@nestjs/common'
import {Subject} from 'rxjs'

import {IOnAir} from './di'
import {ChannelIdentifier} from './ChannelsProvider.interface'
import {IDigitallyImported} from './DigitallyImported.interface'
import {ILogger} from './Logger.interface'
import {IOnAirProvider} from './OnAirProvider.interface'

export function hash_on_air (on_air: IOnAir[]): string {
    const input = JSON.stringify(on_air.map(now_playing => now_playing.to_dto()))

    return crypto
        .createHash('md5')
        .update(input, 'utf8')
        .digest('hex')
}

@Injectable()
export class OnAirProvider extends Subject<IOnAirProvider> implements IOnAirProvider, OnModuleInit {
    private readonly logger: ILogger
    private readonly digitally_imported: IDigitallyImported
    private readonly by_id: Map<number, IOnAir> = new Map()
    private readonly by_key: Map<string, IOnAir> = new Map()
    private hash: string

    public constructor (
        @Inject('ILogger') logger: ILogger,
        @Inject('IDigitallyImported') digitally_imported: IDigitallyImported,
    ) {
        super()

        this.logger = logger.child_for_service(OnAirProvider.name)
        this.digitally_imported = digitally_imported
        this.hash = ''

        this.logger.debug('Service instantiated')
    }

    public async onModuleInit (): Promise<void> {
        await this.trigger_update()
    }

    public async trigger_update (): Promise<void> {
        this.logger.trace('Update triggered')

        const on_air = await this.digitally_imported.load_on_air()
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

    public get (identifier: ChannelIdentifier): IOnAir {
        if (typeof identifier === 'string') {
            return this.get_by_channel_key(identifier)
        } else {
            return this.get_by_channel_id(identifier)
        }
    }

    public get_by_channel_id (id: number): IOnAir {
        const now_playing = this.by_id.get(id)

        if (!now_playing) {
            throw new Error(`No data for channel with id ${id} found`)
        }

        return now_playing
    }

    public get_by_channel_key (key: string): IOnAir {
        const now_playing = this.by_key.get(key)

        if (!now_playing) {
            throw new Error(`No data for channel with key "${key}" found`)
        }

        return now_playing
    }

    public get_all (): IOnAir[] {
        return [...this.by_id.values()]
    }
}
