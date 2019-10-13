import {VlcCommand, ParseError} from '../VlcCommand'

export default class IsPlaying extends VlcCommand<[], boolean> {
    public constructor () {
        super({expected_result_length: 1})
    }

    protected pre_parse_validation (response: string[]): void {
        if (!response[0].match(/^[01]$/)) {
            throw new ParseError('Malformed response')
        }
    }

    protected do_parse (response: string[]): boolean {
        return response[0] === '1'
    }
}
