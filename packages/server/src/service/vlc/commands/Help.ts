import {VlcCommand} from '../VlcCommand'

export default class Help extends VlcCommand<[], string[]> {
    protected do_parse (response: string[]): string[] {
        return response
    }
}
