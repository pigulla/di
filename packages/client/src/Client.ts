import Axios, {AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios'
import Bluebird from 'bluebird'
import {
    FORBIDDEN,
    NO_CONTENT,
    NOT_FOUND,
    OK,
} from 'http-status-codes'

import {
    ChannelDTO,
    ChannelFilterDTO,
    NowPlayingDTO,
    PlaybackStateDTO,
    PlayDTO,
    ServerStatusDTO,
    VolumeDTO,
} from '@digitally-imported/dto'

import {ChannelNotFoundError, ClientError, ServerNotRunningError} from './error'

export type Options = {
    endpoint: string
}

export class Client {
    private readonly axios: AxiosInstance;

    public constructor (options: Options) {
        this.axios = Axios.create({
            baseURL: options.endpoint,
        })

        this.axios.interceptors.response.use(
            response => response,
            function (error) {
                if (!error.isAxiosError) {
                    throw error
                } else if (error.code === 'ECONNREFUSED') {
                    throw new ServerNotRunningError()
                }

                const response: AxiosResponse = error.response
                throw new ClientError(`Client error (${response.statusText})`, error)
            },
        )
    }

    private request (config: AxiosRequestConfig): Bluebird<AxiosResponse> {
        return Bluebird.resolve(this.axios(config))
    }

    public async is_alive (): Promise<boolean> {
        try {
            await this
                .request({
                    method: 'HEAD',
                    url: '/server',
                })
            return true
        } catch (error) {
            if (error instanceof ServerNotRunningError) {
                return false
            }

            throw error
        }
    }

    public async shutdown (): Promise<void> {
        await this
            .request({
                method: 'DELETE',
                url: '/server',
            })
    }

    public async get_server_status (): Promise<ServerStatusDTO> {
        return this
            .request({
                method: 'GET',
                url: '/server',
            })
            .get('data')
    }

    public async update (): Promise<void> {
        await this
            .request({
                method: 'PUT',
                url: '/server/update',
            })
    }

    public async set_volume (value: number): Promise<void> {
        const data: VolumeDTO = {volume: value}

        await this
            .request({
                method: 'PUT',
                url: '/volume',
                data,
            })
    }

    public async get_volume (): Promise<number> {
        return this
            .request({
                method: 'GET',
                url: '/volume',
            })
            .get('data')
            .get('volume')
    }

    public async is_playing (): Promise<boolean> {
        const response = await this
            .request({
                method: 'HEAD',
                url: '/playback',
                validateStatus: status => [NO_CONTENT, NOT_FOUND].includes(status),
            })

        return response.status === NO_CONTENT
    }

    public async start_playback (channel_key: string): Promise<void> {
        const data: PlayDTO = {channel: channel_key}

        const response = await this
            .request({
                method: 'PUT',
                url: '/playback',
                data,
                validateStatus: status => [NO_CONTENT, NOT_FOUND].includes(status),
            })

        if (response.status === NOT_FOUND) {
            throw new ChannelNotFoundError(channel_key)
        }
    }

    public async stop_playback (): Promise<void> {
        await this
            .request({
                method: 'DELETE',
                url: '/playback',
            })
    }

    public async get_playback_state (): Promise<PlaybackStateDTO> {
        const response = await this
            .request({
                method: 'GET',
                url: '/playback',
                validateStatus: status => [OK, NOT_FOUND].includes(status),
            })

        return response.status === NOT_FOUND ? null : response.data
    }

    public async get_favorites (): Promise<ChannelDTO[]> {
        const response = await this
            .request({
                method: 'GET',
                url: '/favorites',
                validateStatus: status => [OK, FORBIDDEN].includes(status),
            })

        return response.status === FORBIDDEN ? null : response.data
    }

    public async get_channels (): Promise<ChannelDTO[]> {
        return this
            .request({
                method: 'GET',
                url: '/channels',
            })
            .get('data')
    }

    public async get_channel (channel_key: string): Promise<ChannelDTO> {
        const response = await this
            .request({
                method: 'GET',
                url: `/channel/${channel_key}`,
                validateStatus: status => [OK, NOT_FOUND].includes(status),
            })

        if (response.status === NOT_FOUND) {
            throw new ChannelNotFoundError(channel_key)
        }

        return response.data
    }

    public get_channel_filters (): Promise<ChannelFilterDTO[]> {
        return this
            .request({
                method: 'GET',
                url: '/channelfilters',
            })
            .get('data')
    }

    private get_now_playing_on_channel (channel_key: string): Promise<NowPlayingDTO> {
        return this
            .request({
                method: 'GET',
                url: `/channel/${channel_key}/now_playing`,
            })
            .get('data')
            .catch(function (error: AxiosError) {
                if (error?.response?.status === NOT_FOUND) {
                    throw new ChannelNotFoundError(channel_key)
                }

                throw error
            })
    }

    private async get_now_playing_on_channels (): Promise<Map<string, NowPlayingDTO>> {
        const response: NowPlayingDTO[] = await this
            .request({
                method: 'GET',
                url: '/channels/now_playing',
            })
            .get('data')

        return response.reduce((map, now_playing) => map.set(now_playing.channel_key, now_playing), new Map())
    }

    public get_now_playing (): Promise<Map<string, NowPlayingDTO>>
    public get_now_playing (channel_key: string): Promise<NowPlayingDTO>
    public get_now_playing (channel_key?: string): Promise<NowPlayingDTO|Map<string, NowPlayingDTO>> {
        return channel_key === undefined
            ? this.get_now_playing_on_channels()
            : this.get_now_playing_on_channel(channel_key)
    }
}
