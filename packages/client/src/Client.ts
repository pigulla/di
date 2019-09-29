import {ChannelDTO} from '@digitally-imported/dto';
import {FORBIDDEN} from 'http-status-codes';
import Axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import Bluebird from 'bluebird';

import {PremiumAccountRequiredError} from './error';

export type Options = {
    endpoint: string;
}

export class Client {
    private readonly axios: AxiosInstance;

    public constructor (options: Options) {
        this.axios = Axios.create({
            baseURL: options.endpoint,
        });

        this.axios.interceptors.response.use(
            response => response,
            function (error) {
                if (!error.isAxiosError) {
                    throw error;
                }

                const response: AxiosResponse = error.response;

                if (response.status === FORBIDDEN) {
                    throw new PremiumAccountRequiredError();
                }
            }
        );
    }

    private request (config: AxiosRequestConfig): Bluebird<AxiosResponse> {
        return Bluebird.resolve(this.axios(config));
    }

    public async get_channels (): Promise<ChannelDTO[]> {
        return this
            .request({
                method: 'GET',
                url: '/channels',
            })
            .get('data');
    }

    public async get_favorites (): Promise<ChannelDTO[]> {
        return this
            .request({
                method: 'GET',
                url: '/channels/favorites',
            })
            .get('data');
    }
}
