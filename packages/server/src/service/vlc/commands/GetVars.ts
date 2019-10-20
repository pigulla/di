import {VlcCommand, ParseError} from '@server/service/vlc'

export default class GetVars extends VlcCommand<[], Map<string, string>> {
    private static readonly regex = /^([^=]+)=(.*)$/i;

    public constructor () {
        super({command: 'set'})
    }

    protected pre_parse_validation (response: string[]): void {
        for (const line of response) {
            if (!GetVars.regex.test(line)) {
                throw new ParseError('Malformed response')
            }
        }
    }

    protected do_parse (response: string[]): Map<string, string> {
        // It's possible to set values with an equal sign in the name and/or the value - there's no feasible way to
        // handle that so we're not even going to try.
        return response.reduce((map, line) => {
            const matches = GetVars.regex.exec(line) as string[]
            return map.set(matches[1], matches[2])
        }, new Map<string, string>())
    }
}
