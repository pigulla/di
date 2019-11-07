import {VlcCommand, ParseError} from '../VlcCommand';

export default class GetTime extends VlcCommand<[], number> {
    public constructor () {
        super({expected_result_length: 1});
    }

    protected pre_parse_validation (response: string[]): void {
        if (!response[0].match(/^\d+$/)) {
            throw new ParseError('Unexpected response');
        }
    }

    protected do_parse (response: string[]): number {
        return parseInt(response[0], 10);
    }
}
