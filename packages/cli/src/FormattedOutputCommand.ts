import Parser from '@oclif/parser';
import {CLIError} from '@oclif/errors';
import * as csv_stringify from 'csv-stringify/lib/sync';
import {Options as CsvOptions} from 'csv-stringify';
import * as Config from '@oclif/config';
import JSONs from 'json-strictify';
import {table} from 'cli-ux/lib/styled/table';
import {cli} from 'cli-ux';

import {BaseCommand} from './BaseCommand';
import {format} from './flag';

export type OutputOptions<T extends object> = {
    csv: CsvOptions;
    table: table.Columns<T extends Array<infer U> ? U : T>;
}

export abstract class FormattedOutputCommand<T extends object> extends BaseCommand {
    private readonly options: OutputOptions<T>;

    static flags = {
        ...BaseCommand.flags,
        format: format(),
    }

    protected constructor (options: OutputOptions<T>, argv: string[], config: Config.IConfig) {
        super(argv, config);

        this.options = options;
    }

    protected print_csv (data: T): void {
        const data_array = Array.isArray(data) ? data : [data];
        // @ts-ignore
        this.log(csv_stringify(data_array, this.options.csv));
    }

    protected print_json (data: T): void {
        this.log(JSONs.stringify(data));
    }

    protected print_table (data: T): void {
        const data_array = Array.isArray(data) ? data : [data];
        cli.table(data_array, this.options.table);
    }

    protected print_formatted (data: T): void {
        const {flags} = this.parse(this.constructor as Parser.Input<any>);

        switch (flags.format) {
            case 'csv': return this.print_csv(data);
            case 'table': return this.print_table(data);
            case 'json': return this.print_json(data);
            default: throw new CLIError('Unexpected format');
        }
    }
}
