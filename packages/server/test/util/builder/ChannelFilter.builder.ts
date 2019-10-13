import {ChannelFilter} from '../../../src/service/di'

export class ChannelFilterBuilder {
    private channels: Set<number> = new Set()
    private id: number = 42
    private key: string = 'filter_key'
    private meta: boolean = true
    private name: string = 'filter name'

    public with_channels (channels: Iterable<number>): this {
        this.channels = new Set([...channels])
        return this
    }

    public with_id (id: number): this {
        this.id = id
        return this
    }

    public with_key (key: string): this {
        this.key = key
        return this
    }

    public with_meta (meta: boolean): this {
        this.meta = meta
        return this
    }

    public with_name (name: string): this {
        this.name = name
        return this
    }

    public build (): ChannelFilter {
        return new ChannelFilter(
            this.channels,
            this.id,
            this.key,
            this.meta,
            this.name,
        )
    }
}

export const ambient = new ChannelFilterBuilder()
    .with_name('Ambient')
    .with_key('ambient')
    .with_id(15)
    .with_meta(false)
    .with_channels([12, 64, 285, 67, 280, 350, 292, 68, 3])
    .build()

export const bass = new ChannelFilterBuilder()
    .with_name('Bass')
    .with_key('bass')
    .with_id(65)
    .with_meta(false)
    .with_channels([13, 105, 424, 293, 275, 230, 91, 177, 474, 15, 291, 184, 403, 181, 352, 348, 325, 198, 210, 289, 290, 292])
    .build()

export const deep = new ChannelFilterBuilder()
    .with_name('Deep')
    .with_key('deep')
    .with_id(88)
    .with_meta(false)
    .with_channels([174, 182, 137, 348, 355])
    .build()
