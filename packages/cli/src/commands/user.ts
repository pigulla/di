import * as Config from '@oclif/config'
import {UserDTO} from '@digitally-imported/dto/lib'

import {FormattedOutputCommand, OutputOptions} from '../FormattedOutputCommand'

export default class User extends FormattedOutputCommand<UserDTO> {
    public static description = 'Get user info.';

    public static flags = {
        ...FormattedOutputCommand.flags,
    }

    public constructor (argv: string[], config: Config.IConfig) {
        const output_options: OutputOptions<UserDTO> = {
            csv: {
                header: true,
                columns: [
                    {key: 'type'},
                    {key: 'authenticated'},
                    {key: 'id'},
                    {key: 'has_premium'},
                    {key: 'has_password'},
                    {key: 'created_at'},
                ],
            },
            table: {
                type: {},
                authenticated: {},
                id: {},
                has_premium: {},
                has_password: {},
                created_at: {},
            },
        }

        super(output_options, argv, config)
    }

    public async run (): Promise<void> {
        const user = await this.client.get_user()

        this.print_formatted(user)
    }
}
