import {ChannelFilter} from '@src/service/di'

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
