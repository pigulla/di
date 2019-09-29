import {OK, NOT_FOUND} from 'http-status-codes';

import {BaseCommand} from '../BaseCommand';

export default class Play extends BaseCommand {
    static description = 'Play a channel.';

    static flags = {...BaseCommand.flags}

    static args = [
        {
            name: 'channel',
            required: true,
            description: 'The name of the channel to play.',
        },
    ]

    async run (): Promise<void> {
        const {args} = this.parse(Play);

        await this.axios(
            {
                method: 'PUT',
                url: '/playback',
                data: {channel: args.channel},
            },
            {
                [OK]: true,
                [NOT_FOUND]: {
                    message: 'Channel not found',
                    exitCode: 2,
                },
            }
        );
    }
}
