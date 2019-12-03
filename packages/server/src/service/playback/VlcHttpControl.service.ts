import {Inject, OnApplicationShutdown, OnModuleInit} from '@nestjs/common'
import {JsonObject} from 'type-fest'

import {IPlaybackControl} from '..'
import {ILogger} from '../logger'
import {IVlcChildProcessFacade} from './VlcChildProcessFacade.interface'
import {IVlcHttpClient} from './VlcHttpClient.interface'

// See: https://wiki.videolan.org/VLC_HTTP_requests/

export class VlcHttpControl implements IPlaybackControl, OnModuleInit, OnApplicationShutdown {
    private readonly logger: ILogger
    private readonly child_process: IVlcChildProcessFacade
    private readonly vlc_http_client: IVlcHttpClient

    public constructor (
        @Inject('ILogger') logger: ILogger,
        @Inject('IVlcHttpClient') vlc_http_client: IVlcHttpClient,
        @Inject('vlc_child_process') vlc_child_process: IVlcChildProcessFacade,
    ) {
        this.logger = logger.child_for_service(VlcHttpControl.name)
        this.child_process = vlc_child_process
        this.vlc_http_client = vlc_http_client
    }

    public async onModuleInit (): Promise<void> {
        this.logger.debug('Starting service')

        await this.child_process.start()
        const {hostname, port} = this.child_process
        this.logger.info(`VLC listening on ${hostname}:${port}`)
    }

    public async onApplicationShutdown (_signal?: string): Promise<void> {
        this.logger.debug('Stopping service')

        await this.child_process.stop()
    }

    private get http_client (): IVlcHttpClient {
        if (!this.vlc_http_client) {
            throw new Error('Client not available')
        }

        return this.vlc_http_client
    }

    public async get_playback_backend_information (): Promise<JsonObject> {
        const status = await this.http_client.get_status()

        return {
            version: status.version,
        }
    }

    public get_pid (): number {
        return this.child_process.get_pid()
    }

    public get_current_channel_key (): Promise<string|null> {
        return this.http_client.get_current_channel_key()
    }

    public get_volume (): Promise<number> {
        return this.http_client.get_volume()
    }

    public is_playing (): Promise<boolean> {
        return this.http_client.is_playing()
    }

    public play (url: string): Promise<void> {
        return this.http_client.play(url)
    }

    public set_volume (volume: number): Promise<void> {
        return this.http_client.set_volume(volume)
    }

    public stop (): Promise<void> {
        return this.http_client.stop()
    }
}
