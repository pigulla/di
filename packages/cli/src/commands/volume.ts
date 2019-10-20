import {CLIError} from '@oclif/errors'

import {BaseCommand} from '@cli/BaseCommand'

interface ParsedInput {
    relative: boolean
    value: number
}

export default class Volume extends BaseCommand {
    public static description = 'Get or set the audio volume.'

    public static flags = {...BaseCommand.flags}

    public static args = [
        {
            name: 'value',
            required: false,
            description: 'The audio volume.',
        },
    ]

    private parse_input (input: string): ParsedInput {
        const matches = /^([-+])?\d+$/.exec(input)

        if (!matches) {
            throw new CLIError('Invalid argument')
        }

        return {
            relative: !!matches[1],
            value: parseInt(input, 10) / 100,
        }
    }

    private async handle_set (command: ParsedInput): Promise<void> {
        const volume = command.relative
            ? (await this.client.get_volume() + command.value)
            : command.value

        await this.client.set_volume(volume)
    }

    public async run (): Promise<void> {
        const {args} = this.parse(Volume)

        if (args.value) {
            const cmd = this.parse_input(args.value)
            await this.handle_set(cmd)
        } else {
            const volume = await this.client.get_volume()
            this.log(Math.round(volume * 100).toString())
        }
    }
}
