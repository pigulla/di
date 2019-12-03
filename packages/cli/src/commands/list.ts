import * as Config from '@oclif/config'
import chalk from 'chalk'

import {ChannelDTO} from '@digitally-imported/dto'

import {FormattedOutputCommand, OutputOptions} from '../FormattedOutputCommand'

export default class List extends FormattedOutputCommand<ChannelDTO[]> {
    public static description = 'List channels.';

    public constructor (argv: string[], config: Config.IConfig) {
        const output_options: OutputOptions<ChannelDTO[]> = {
            csv: {
                header: true,
                columns: [
                    {key: 'id'},
                    {key: 'key'},
                    {key: 'name'},
                    {key: 'director'},
                    {key: 'description'},
                ],
            },
            table: {
                name: {},
                key: {
                    get (row: ChannelDTO) {
                        return chalk.dim(row.key)
                    },
                },
                description: {},
            },
        }

        super(output_options, argv, config)
    }

    public async run (): Promise<void> {
        const channels = await this.client.get_channels()

        this.print_formatted(channels)
    }
}
