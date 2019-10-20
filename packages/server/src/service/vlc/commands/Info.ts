import joi from '@hapi/joi'

import {VlcCommand, ParseError} from '@server/service/vlc'

export interface TrackInfo {
    artist: string
    filename: string
    title: string
    genre: string
    now_playing: string
}

export const track_info_schema = joi.object().keys({
    artist: joi.string(),
    filename: joi.string(),
    title: joi.string(),
    genre: joi.string(),
    now_playing: joi.string(),
}).options({presence: 'required'})

export default class Info extends VlcCommand<[], TrackInfo|null> {
    private stream_0_index: number|null = null;

    protected pre_parse_validation (response: string[]): void {
        const index = response.findIndex(line => line.includes('Stream 0'))

        if (response.length > 0 && index === -1) {
            throw new ParseError('Stream information not found')
        }

        this.stream_0_index = response.length === 0 ? null : index
    }

    protected do_parse (response: string[]): TrackInfo|null {
        if (this.stream_0_index === null) {
            return null
        }

        return response
            .slice(0, this.stream_0_index)
            .filter(line => line.match(/^\|\s[_a-z]+:\s/))
            .map(line => line.substr(2).split(': ', 2))
            .reduce((o, [k, v]) => (k in o) ? Object.assign(o, {[k]: v}) : o, {
                artist: '',
                title: '',
                genre: '',
                filename: '',
                now_playing: '',
            })
    }
}
