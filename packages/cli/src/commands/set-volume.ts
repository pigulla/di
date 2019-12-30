import {CLIError} from '@oclif/errors'
import JSONs from 'json-strictify'

import BaseCommand from '../base'
import {HandleClientError} from '../handle-client-error'

export default class SetVolumeCommand extends BaseCommand {
    public static description = 'Set the playback volume.'

    public static flags = {...BaseCommand.flags}

    public static args = [
        {
            name: 'volume',
            required: true,
            description: 'The new volume (between 0 and 125).',
            parse (input: string): string {
                const matches = /^\d+$/.exec(input)

                if (!matches) {
                    throw new CLIError('Volume must be an integer')
                }

                const value = parseInt(input, 10)

                if (value < 0 || value > 125) {
                    throw new CLIError('Volume must be between 0 and 125')
                }

                return value.toString()
            },
        },
    ]

    @HandleClientError()
    public async run (): Promise<void> {
        const {args} = this.parse(SetVolumeCommand)
        const volume = parseInt(args.volume, 10)
        await this.client.set_volume(volume)

        this.print_formatted()
    }

    protected print_text (): void {
        // no output
    }

    protected print_json (): void {
        this.log(JSONs.stringify({}))
    }
}
