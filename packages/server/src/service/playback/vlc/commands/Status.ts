import {Command, ParseError} from '@server/service/playback/vlc'

export enum State {
    PLAYING = 'playing',
    STOPPED = 'stopped',
}

export interface StatusData {
    new_input: string|null
    audio_volume: number
    state: State
}

const input_regex: {[P in keyof StatusData]: RegExp} = {
    new_input: /^\( new input: (.+) \)$/,
    audio_volume: /^\( audio volume: (\d+) \)$/,
    state: /^\( state (.+) \)$/,
}

function extract_item (response: string[], key: keyof StatusData): string|null {
    const regex = input_regex[key]
    const line = response.find(line => regex.test(line))
    const matches = line ? regex.exec(line) : null

    return matches ? matches[1] : null
}

export default class Status extends Command<[], StatusData> {
    protected pre_parse_validation (response: string[]): void {
        if (response.length === 0) {
            throw new ParseError('Malformed response')
        }
    }

    protected do_parse (response: string[]): StatusData {
        const data: {[P in keyof StatusData]: string|null} = {
            new_input: extract_item(response, 'new_input'),
            audio_volume: extract_item(response, 'audio_volume'),
            state: extract_item(response, 'state'),
        }

        if (!data.audio_volume || !data.state) {
            throw new ParseError('Malformed response')
        }
        if (!Object.values(State).includes(data.state as State)) {
            throw new ParseError('Malformed response')
        }

        return {
            new_input: data.new_input,
            audio_volume: parseInt(data.audio_volume, 10),
            state: data.state as State,
        }
    }
}
