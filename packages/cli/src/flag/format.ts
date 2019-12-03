import {flags} from '@oclif/command'
import {IOptionFlag} from '@oclif/command/lib/flags'

export enum Format {
    table = 'table',
    json = 'json',
    csv = 'csv',
}

export function format (formats: Format[] = [Format.table, Format.json, Format.csv]): IOptionFlag<string|undefined> {
    return flags.build({
        char: 'f',
        description: 'The output format.',
        options: [...new Set(formats)],
        default: 'table',
        required: false,
        env: 'DI_OUTPUT_FORMAT',
    })()
}
