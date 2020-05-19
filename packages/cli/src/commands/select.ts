import {flags} from '@oclif/command'
import {Input} from '@oclif/command/lib/flags'
import inquirer from 'inquirer'
import JSONs from 'json-strictify'

import {ChannelDTO} from '@digitally-imported/dto'

import BaseCommand from '../base'
import {HandleClientError} from '../handle-client-error'

export default class SelectCommand extends BaseCommand<[ChannelDTO]> {
    public static description = 'List all available channels.'

    public static examples = ['$ di channels']

    public static flags = {
        ...BaseCommand.flags,
        'favorites-only': flags.boolean({
            char: 'f',
            description: 'List favorite channels only',
            default: false,
        }),
    }

    public static args = []

    @HandleClientError()
    public async run(): Promise<void> {
        const {flags} = this.parse((this.constructor as any) as Input<any>)
        // @ts-ignore
        const favorites_only = flags['favorites-only']
        const channels: ChannelDTO[] | null = favorites_only
            ? await this.client.get_favorites()
            : await this.client.get_channels()

        if (!channels) {
            this.error('Favorites are not available')
        }

        const answers = await inquirer.prompt([
            {
                name: 'channel_key',
                type: 'list',
                message: 'Select a channel',
                pageSize: 10,
                choices: channels
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(channel => ({name: channel.name, value: channel.key})),
            },
        ])
        const channel = channels.find(channel => channel.key === answers.channel_key)

        if (!channel) {
            this.error(`Channel ${answers.channel_key} not found`)
        }

        await this.client.start_playback(channel.key)
        this.print_formatted(channel)
    }

    protected print_text(channel: ChannelDTO): void {
        this.log(`Now playing channel ${channel.name}`)
    }

    protected print_json(channel: ChannelDTO): void {
        this.log(JSONs.stringify(channel))
    }
}
