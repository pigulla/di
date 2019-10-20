import chalk from 'chalk'
import * as Config from '@oclif/config'

import {PlaybackStateDTO} from '@digitally-imported/dto/lib'

import {FormattedOutputCommand, OutputOptions} from '@cli/FormattedOutputCommand'

export default class Status extends FormattedOutputCommand<PlaybackStateDTO> {
    public static description = 'Get server status.';

    public static flags = {
        ...FormattedOutputCommand.flags,
    }

    public constructor (argv: string[], config: Config.IConfig) {
        const output_options: OutputOptions<PlaybackStateDTO> = {
            csv: {
                header: true,
                columns: [
                    {key: 'channel'},
                    {key: 'volume'},
                    {key: 'now_playing'},
                ],
            },
            table: {
                channel: {
                    get ({channel}) {
                        return channel ? channel.name : chalk.dim('none')
                    },
                },
                volume: {
                    get ({volume}) {
                        return Math.round(volume * 100) + '%'
                    },
                },
                now_playing: {
                    get ({now_playing}) {
                        return now_playing ? 'yes' : 'no'
                    },
                },
            },
        }

        super(output_options, argv, config)
    }

    public async run (): Promise<void> {
        const playback_state = await this.client.get_playback_state()

        this.print_formatted(playback_state)
    }
}
