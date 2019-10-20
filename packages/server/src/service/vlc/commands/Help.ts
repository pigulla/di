import {VlcCommand} from '@server/service/vlc'

export default class Help extends VlcCommand<[], string[]> {
    protected do_parse (response: string[]): string[] {
        return response
    }
}
