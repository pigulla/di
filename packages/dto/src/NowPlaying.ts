type NowPlayingProperties = {
    channel_id: number
    channel_key: string
    display_artist: string
    display_title: string
}

export class NowPlayingDTO {
    channel_id!: number
    channel_key!: string
    display_artist!: string
    display_title!: string

    public static create (properties: NowPlayingProperties): NowPlayingDTO {
        return Object.assign(new NowPlayingDTO(), properties)
    }
}
