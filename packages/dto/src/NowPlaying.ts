export class NowPlayingDTO {
    channel_id!: number
    channel_key!: string
    display_artist!: string
    display_title!: string

    constructor (now_playing: NowPlayingDTO) {
        Object.assign(this, now_playing)
    }
}
