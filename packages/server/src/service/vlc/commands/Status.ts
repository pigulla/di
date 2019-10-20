import joi from '@hapi/joi'

import {ParseError, VlcCommand} from '@server/service/vlc'
import {volume_to_percentage} from './index'

export interface StatusData {
    input: string|null
    volume: number
    state: 'playing'|'stopped'
}

export const status_data_schema = joi.object().keys({
    input: joi.string().allow(null),
    volume: joi.number().min(0),
    state: joi.string().valid('playing', 'stopped'),
}).options({presence: 'required'})

/**
 * Execute the "status" command and return its data.
 *
 * Unfortunately, VLC seems to not follow any useful convention - sometimes the key/value pairs are separated by a colon
 * and sometimes they're not. That's why this class only supports a specific set of states that it knows how to parse.
 */
export default class Status extends VlcCommand<[], StatusData> {
    protected do_parse (response: string[]): StatusData {
        const state_matches = response
            .map(line => /^\( state (stopped|playing) \)$/.exec(line)).filter(matches => !!matches)[0]
        const volume_matches = response
            .map(line => /^\( audio volume: (\d+) \)$/.exec(line)).filter(matches => !!matches)[0]
        const input_matches = response
            .map(line => /^\( new input: (.+) \)$/.exec(line)).filter(matches => !!matches)[0]

        if (!state_matches) {
            throw new ParseError('No data found for "state"')
        }
        if (!volume_matches) {
            throw new ParseError('No data found for "volume"')
        }

        return {
            state: state_matches[1] as StatusData['state'],
            volume: volume_to_percentage(parseInt(volume_matches[1], 10)),
            input: input_matches ? input_matches[1] : null,
        }
    }
}
