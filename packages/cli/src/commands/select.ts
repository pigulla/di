/* eslint-disable import/no-duplicates */

import chalk from 'chalk'
import {flags} from '@oclif/command'
// @ts-ignore
import * as inquirer_autocomplete from 'inquirer-autocomplete-prompt'
import * as inquirer from 'inquirer'
import {QuestionCollection} from 'inquirer'

import {BaseCommand} from '../BaseCommand'
import {ChannelDTO} from '@digitally-imported/dto/lib'

interface Answers {
    channel: string
}

inquirer.registerPrompt('autocomplete', inquirer_autocomplete)

export default class Select extends BaseCommand {
    public static description = 'Interactively select a channel to play.'

    public static flags = {
        ...BaseCommand.flags,
        'favorites-only': flags.boolean({
            char: 'o',
            description: 'Select from favorites only.',
            default: false,
        }),
    }

    public async run (): Promise<void> {
        const {flags} = this.parse(Select)
        const favorites_only = flags['favorites-only']

        const channels = await (favorites_only ? this.client.get_favorites() : this.client.get_channels())
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
        } as any as QuestionCollection<Answers>)

        await this.client.start_playback(answers.channel)
    }
}
