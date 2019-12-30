import BaseCommand from '../base'
import {HandleClientError} from '../handle-client-error'
import JSONs from 'json-strictify'

export default class PingCommand extends BaseCommand<[boolean]> {
    public static description = 'Test if the server is alive.'

    public static flags = {...BaseCommand.flags}

    @HandleClientError()
    public async run (): Promise<void> {
        const is_running = await this.client.is_alive()

        this.print_formatted(is_running)
    }

    protected print_text (is_running: boolean): void {
        this.log(is_running ? 'Server is running' : 'Server not running')
    }

    protected print_json (is_running: boolean): void {
        this.log(JSONs.stringify({is_running}))
    }
}
