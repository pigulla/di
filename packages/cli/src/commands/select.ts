import chalk from 'chalk';
import inquirer, {ListQuestionOptions, QuestionCollection} from 'inquirer';

import {flags} from '@oclif/command';
// @ts-ignore
import inquirer_autocomplete from 'inquirer-autocomplete-prompt';

import {BaseCommand} from '../BaseCommand';
import {ChannelDTO} from '@digitally-imported/dto/lib';

interface Answers {
    channel: string;
}

interface AutocompleteQuestion<A> extends Pick<ListQuestionOptions<A>, 'choices' | 'filter' | 'pageSize'> {
    type: 'autocomplete';
    source: (answers: A, input: string) => Promise<Array<{name: string, value: any}>>;
}

inquirer.registerPrompt('autocomplete', inquirer_autocomplete);

export default class Select extends BaseCommand {
    static description = 'Interactively select a channel to play.'

    static flags = {
        ...BaseCommand.flags,
        'favorites-only': flags.boolean({
            char: 'f',
            description: 'Select from favorites only.',
            default: false,
        }),
    }

    private async get_channels (favorites_only: boolean): Promise<ChannelDTO[]> {
        const response = await this._axios.get(favorites_only ? '/channels/favorites' : '/channels');
        return response.data;
    }

    public async run (): Promise<void> {
        const {flags} = this.parse(Select);
        const favorites_only = flags['favorites-only'];

        const channels = await this.get_channels(favorites_only);
        const max_name_length = channels.reduce((len, {name}) => Math.max(name.length, len), 0);

        function format_name (channel: ChannelDTO): string {
            const prefix = favorites_only
                ? ''
                : (channel.is_favorite ? chalk.red('* ') : '  ');

            return prefix + channel.name.padEnd(max_name_length) + chalk.dim(channel.description);
        }

        const choices = channels
            .map(channel => ({
                name: format_name(channel),
                value: channel.key,
                channel_name: channel.name.toLowerCase()
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
        const answers: Answers = await inquirer.prompt<Answers>({
            type: 'autocomplete',
            name: 'channel',
            message: 'Select a channel',
            pageSize: 10,
            async source (_answers, input) {
                return !input
                    ? choices
                    : choices.filter(({channel_name}) => channel_name.includes(input.toLowerCase()));
            },
        } as AutocompleteQuestion<Answers> as any as QuestionCollection<Answers>);

        await this._axios.put('/playback', {channel: answers.channel})
    }
}
