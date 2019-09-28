import {CLIError} from '@oclif/errors';
import {Command, flags} from '@oclif/command';
import Axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {Input} from '@oclif/command/lib/flags';

export type ResponseCodeMap = {
    [code: number]: {
        exitCode: number;
        message: string;
    }|true;
}

export abstract class BaseCommand extends Command {
    public static flags = {
        host: flags.string({
            char: 'h',
            description: 'The host where the server is running',
            env: 'DI_HOST',
            default: 'localhost',
        }),
        port: flags.integer({
            char: 'p',
            description: 'The port where the server is running',
            env: 'DI_PORT',
            default: 4979,
        }),
        protocol: flags.string({
            char: 'o',
            description: 'The protocol',
            env: 'DI_PROTOCOL',
            default: 'http',
            options: ['http', 'https'],
        }),
    }

    protected async axios(
        config: AxiosRequestConfig,
        responseCodeMap: ResponseCodeMap = {200: true, 204: true},
    ): Promise<AxiosResponse> {
        const options = {
            ...config,
            baseURL: this.base_url,
            validateStatus (status: number): boolean {
                return Object.keys(responseCodeMap).map(key => parseInt(key, 10)).includes(status);
            }
        };

        const response = await Axios.request(options);
        const value = responseCodeMap[response.status];

        if (value === true) {
            return response;
        }

        return this.error(value.message, {exit: value.exitCode});
    }

    private get base_url (): string {
        const {flags} = this.parse(this.constructor as any as Input<any>);
        const {host, port, protocol} = flags;

        return `${protocol}://${host}:${port}`;
    }

    public async catch (error: Error): Promise<void> {
        // @ts-ignore
        if (error.isAxiosError) {
            throw new CLIError(`Communication failure: ${error.message}`);
        }

        throw error;
    }
}
