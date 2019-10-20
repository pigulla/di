import {Command} from '@server/service/playback/vlc'

export default class GetTitle extends Command<[], string> {
    public constructor () {
        super({expected_result_length: 1})
    }

    protected do_parse (response: string[]): string {
        return response[0]
    }
}
