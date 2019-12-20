import chalk from 'chalk'
// @ts-ignore
import * as inquirer_autocomplete from 'inquirer-autocomplete-prompt'
import * as inquirer from 'inquirer'

import {ChannelDTO} from '@digitally-imported/dto'

import {BaseCommand} from '../BaseCommand'

interface Answers {
    channel: string
}

inquirer.registerPrompt('autocomplete', inquirer_autocomplete)

export default class Select extends BaseCommand {
    public static description = 'Interactively select a channel to play.'

    public async run (): Promise<void> {
        const channels = await this.client.get_channels()
        const max_name_length = channels.reduce((len, {name}) => Math.max(name.length, len), 0)

        function format_name (channel: ChannelDTO): string {
            return channel.name.padEnd(max_name_length) + chalk.dim(channel.description)
        }

        const choices = channels
            .map(channel => ({
                name: format_name(channel),
                value: channel.key,
                channel_name: channel.name.toLowerCase(),
            }))
            .sort((a, b) => a.name.localeCompare(b.name))

        const answers: Answers = await inquirer.prompt({
            type: 'autocomplete',
            name: 'channel',
            message: 'Select a channel',
            pageSize: 10,
            async source (_answers: Answers, input: string) {
                return !input
                    ? choices
                    : choices.filter(({channel_name}) => channel_name.includes(input.toLowerCase()))
            },
        } as any as inquirer.QuestionCollection<Answers>)

        await this.client.start_playback(answers.channel)
    }
}
