import {VlcCommand} from '../VlcCommand';

export default class GetTitle extends VlcCommand<[], string> {
    public constructor () {
        super({expected_result_length: 1});
    }

    protected do_parse (response: string[]): string {
        return response[0];
    }
}
