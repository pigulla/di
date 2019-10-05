import {Command, ParseError} from '@server/service/playback/vlc'
import {volume_to_percentage} from './index'

export default class VolumeGet extends Command<[], number> {
    public constructor () {
        super({command: 'volume', expected_result_length: 1})
    }

    protected pre_parse_validation (response: string[]): void {
        if (!response[0].match(/^\d+$/)) {
            throw new ParseError('Unexpected response')
        }
    }

    protected do_parse (response: string[]): number {
        const volume = parseInt(response[0], 10)

        return volume_to_percentage(volume)
    }
}
