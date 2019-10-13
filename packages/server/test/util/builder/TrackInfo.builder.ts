import {TrackInfo} from '../../../src/service/vlc/commands/Info'

export class TrackInfoBuilder {
    private artist: string = 'Artist'
    private filename: string = 'Filename'
    private title: string = 'Title'
    private genre: string = 'Genre'
    private now_playing: string = 'now-playing'

    public with_artist (artist: string): this {
        this.artist = artist
        return this
    }

    public with_filename (filename: string): this {
        this.filename = filename
        return this
    }

    public with_title (title: any): this {
        this.title = title
        return this
    }

    public with_genre (genre: string): this {
        this.genre = genre
        return this
    }

    public with_now_playing (now_playing: string): this {
        this.now_playing = now_playing
        return this
    }

    public build (): TrackInfo {
        return {
            artist: this.artist,
            filename: this.filename,
            title: this.title,
            genre: this.genre,
            now_playing: this.now_playing,
        }
    }
}
