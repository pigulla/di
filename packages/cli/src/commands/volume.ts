import {CLIError} from '@oclif/errors';

import {BaseCommand} from '../BaseCommand';

interface ParsedInput {
    mode: 'absolute'|'relative';
    value: number;
}

export default class Volume extends BaseCommand {
    static description = 'Get or set the audio volume.'

    static flags = {...BaseCommand.flags}

    static args = [
        {
            name: 'value',
            required: false,
            description: 'The audio volume.',
        },
    ]

    private parse_input (input: string): ParsedInput {
        const matches = /^([-+])?\d+$/.exec(input);

        if (!matches) {
            throw new CLIError('Invalid argument');
        }

        return {
            mode: matches[1] ? 'relative' : 'absolute',
            value: parseInt(input, 10) / 100,
        };
    }

    private async get_volume (): Promise<number> {
        const response = await this.axios(
            {
                method: 'GET',
                url: '/volume',
            }
        );

        return response.data.volume;
    }

    private async handle_set (command: ParsedInput): Promise<void> {
        const volume = command.mode === 'relative'
            ? (await this.get_volume() + command.value)
            : command.value;

        await this.axios({
            method: 'PUT',
            url: '/volume',
            data: {volume},
        });
    }

    public async run (): Promise<void> {
        const {args} = this.parse(Volume);

        if (args.value) {
            const cmd = this.parse_input(args.value);
            await this.handle_set(cmd);
        } else {
            const volume = await this.get_volume();
            this.log(Math.round(volume * 100).toString());
        }
    }
}
