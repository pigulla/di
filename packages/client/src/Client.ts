import {ChannelDTO, ChannelFilterDTO, PlaybackStateDTO, ServerStatusDTO, UserDTO} from '@digitally-imported/dto';
import {FORBIDDEN, NOT_FOUND, NO_CONTENT} from 'http-status-codes';
import Axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import Bluebird from 'bluebird';

import {ClientError, PremiumAccountRequiredError, ServerNotRunningError} from './error';

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
                } else if (error.code === 'ECONNREFUSED') {
                    throw new ServerNotRunningError();
                }

                const response: AxiosResponse = error.response;

                if (response.status === FORBIDDEN) {
                    throw new PremiumAccountRequiredError();
                }

                throw new ClientError('Client error', error);
            }
        );
    }

    private request (config: AxiosRequestConfig): Bluebird<AxiosResponse> {
        return Bluebird.resolve(this.axios(config));
    }

    public async get_server_status (): Promise<ServerStatusDTO> {
        return this
            .request({
                method: 'GET',
                url: '/server',
            })
            .get('data');
    }

    public async update (): Promise<void> {
        await this
            .request({
                method: 'PUT',
                url: '/update',
            });
    }

    public async set_volume (value: number): Promise<void> {
        await this
            .request({
                method: 'PUT',
                url: '/volume',
                data: {volume: value},
            });
    }

    public async get_volume (): Promise<number> {
        return this
            .request({
                method: 'GET',
                url: '/volume',
            })
            .get('data');
    }

    public async is_playing (): Promise<boolean> {
        const response = await this
            .request({
                method: 'HEAD',
                url: '/playback',
                validateStatus: status => [NO_CONTENT, NOT_FOUND].includes(status),
            });

        return response.status === NO_CONTENT;
    }

    public async start_playback (channel: string): Promise<void> {
        await this
            .request({
                method: 'PUT',
                url: '/playback',
                data: {channel},
            });
    }

    public async stop_playback (): Promise<void> {
        await this
            .request({
                method: 'DELETE',
                url: '/playback',
            });
    }

    public async get_playback_state (): Promise<PlaybackStateDTO> {
        return this
            .request({
                method: 'GET',
                url: '/playback',
            })
            .get('data');
    }

    public async get_channels (): Promise<ChannelDTO[]> {
        return this
            .request({
                method: 'GET',
                url: '/channels',
            })
            .get('data');
    }

    public async get_channel (key: string): Promise<ChannelDTO> {
        return this
            .request({
                method: 'GET',
                url: `/channels/${key}`,
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

    public get_channel_filters (): Promise<ChannelFilterDTO[]> {
        return this
            .request({
                method: 'GET',
                url: '/channelfilters',
            })
            .get('data');
    }

    public get_user (): Promise<UserDTO> {
        return this
            .request({
                method: 'GET',
                url: '/user',
            })
            .get('data');
    }
}
