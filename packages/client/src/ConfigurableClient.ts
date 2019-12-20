import {AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError} from 'axios'
import semver, {SemVer} from 'semver'
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
    OnAirDTO,
    PlaybackStateDTO,
    PlayDTO,
    ServerStatusDTO,
    VolumeDTO,
} from '@digitally-imported/dto'

import {IClient} from './Client.interface'
import {ChannelNotFoundError, ClientError, ServerNotRunningError} from './error'

type AxiosFactory = (config?: AxiosRequestConfig) => AxiosInstance

export type ConfigurableOptions = {
    axios_factory: AxiosFactory
    client_version: string
    process: NodeJS.Process
    endpoint: string
}

export class ConfigurableClient implements IClient {
    private readonly axios: AxiosInstance
    private readonly client_version: SemVer
    private readonly process: NodeJS.Process

    public constructor (options: ConfigurableOptions) {
        const client_version = semver.parse(options.client_version)

        if (!client_version) {
            throw new Error('Invalid version string')
        }

        this.client_version = client_version
        this.process = options.process
        this.axios = options.axios_factory({baseURL: options.endpoint})

        this.axios.interceptors.response.use(
            response => {
                this.check_versions(response.headers['X-DI-Version'])
                return response
            },
            error => {
                if (!error.isAxiosError) {
                    throw error
                } else if (error.code === 'ECONNREFUSED') {
                    throw new ServerNotRunningError()
                }

                throw new ClientError((error as AxiosError).message, error)
            },
        )
    }

    private check_versions (header: string): void {
        if (!header) {
            return this.process.emitWarning('Server did not send an app version header')
        }

        const server_version: SemVer|null = semver.parse(header)

        if (!server_version) {
            return this.process.emitWarning('Server sent an invalid app version header')
        }

        if (semver.diff(this.client_version, server_version) === 'major') {
            this.process.emitWarning(
                `App version mismatch (server is ${server_version}, client is ${this.client_version})`,
            )
        }
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

    public async start_playback (channel_key: string): Promise<ChannelDTO> {
        const data: PlayDTO = {channel: channel_key}

        const response = await this
            .request({
                method: 'PUT',
                url: '/playback',
                data,
                validateStatus: status => [OK, NOT_FOUND].includes(status),
            })

        if (response.status === NOT_FOUND) {
            throw new ChannelNotFoundError(channel_key)
        }

        return response.data
    }

    public async stop_playback (): Promise<void> {
        await this
            .request({
                method: 'DELETE',
                url: '/playback',
            })
    }

    public async get_playback_state (): Promise<PlaybackStateDTO|null> {
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

    private async get_on_air_on_channel (channel_key: string): Promise<OnAirDTO> {
        const response = await this
            .request({
                method: 'GET',
                url: `/channel/${channel_key}/on_air`,
                validateStatus: status => [OK, NOT_FOUND].includes(status),
            })

        if (response.status === NOT_FOUND) {
            throw new ChannelNotFoundError(channel_key)
        }

        return response.data
    }

    private async get_on_air_on_channels (): Promise<Map<string, OnAirDTO>> {
        const response: OnAirDTO[] = await this
            .request({
                method: 'GET',
                url: '/channels/on_air',
            })
            .get('data')

        return response.reduce((map, on_air) => map.set(on_air.channel_key, on_air), new Map())
    }

    public get_on_air (): Promise<Map<string, OnAirDTO>>
    public get_on_air (channel_key: string): Promise<OnAirDTO>
    public get_on_air (channel_key?: string): Promise<OnAirDTO|Map<string, OnAirDTO>> {
        return channel_key === undefined
            ? this.get_on_air_on_channels()
            : this.get_on_air_on_channel(channel_key)
    }
}
