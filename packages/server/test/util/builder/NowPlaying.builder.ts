import {IOnAir, IChannel} from '~src/domain/di'
import {NowPlaying} from '~src/infrastructure/di'

export class NowPlayingBuilder {
    private channel_id: number = 7
    private channel_key: string = 'psychill'
    private artist: string = 'Shpongle'
    private title: string = 'Outer Shpongolia'

    public for_channel(channel: IChannel): this {
        return this.with_channel_id(channel.id).with_channel_key(channel.key)
    }

    public with_channel_id(channel_id: number): this {
        this.channel_id = channel_id
        return this
    }

    public with_channel_key(channel_key: string): this {
        this.channel_key = channel_key
        return this
    }

    public with_artist(artist: string): this {
        this.artist = artist
        return this
    }

    public with_title(title: string): this {
        this.title = title
        return this
    }

    public build(): IOnAir {
        return new NowPlaying(this.channel_id, this.channel_key, this.artist, this.title)
    }
}
