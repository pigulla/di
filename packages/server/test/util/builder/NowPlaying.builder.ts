import {NowPlaying, Channel} from '@server/service/di'

export class NowPlayingBuilder {
    private channel_id: number = 7
    private channel_key: string = 'psychill'
    private display_artist: string = 'Shpongle'
    private display_title: string = 'Outer Shpongolia'

    public for_channel (channel: Channel): this {
        return this
            .with_channel_id(channel.id)
            .with_channel_key(channel.key)
    }

    public with_channel_id (channel_id: number): this {
        this.channel_id = channel_id
        return this
    }

    public with_channel_key (channel_key: string): this {
        this.channel_key = channel_key
        return this
    }

    public with_display_artist (display_artist: any): this {
        this.display_artist = display_artist
        return this
    }

    public with_display_title (display_title: string): this {
        this.display_title = display_title
        return this
    }

    public build (): NowPlaying {
        return new NowPlaying(
            this.channel_id,
            this.channel_key,
            this.display_artist,
            this.display_title,
        )
    }
}
