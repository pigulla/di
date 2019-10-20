import {Injectable, OnModuleInit, OnApplicationShutdown, Inject} from '@nestjs/common'

import {IConfigProvider, ILogger, IPlaybackControl, ControlInformation} from '@server/service'
import {Connector, IConnector} from './Connector'
import {ChildProcessFacade} from '@server/service/playback/vlc/ChildProcessFacade'
import {ControlError} from '@server/service/playback/vlc/ControlError'

@Injectable()
export class VlcControl implements IPlaybackControl, OnModuleInit, OnApplicationShutdown {
    private readonly logger: ILogger
    private readonly config_provider: IConfigProvider
    private readonly connector: IConnector

    public constructor (
        @Inject('ILogger') logger: ILogger,
        @Inject('IConfigProvider') config_provider: IConfigProvider,
    ) {
        const child_process_facade = new ChildProcessFacade(config_provider.vlc_path, config_provider.vlc_timeout)

        this.logger = logger.for_service(VlcControl.name)
        this.config_provider = config_provider
        this.connector = new Connector(child_process_facade)

        this.logger.log('Service instantiated')
    }

    public async onModuleInit (): Promise<void> {
        return this.connector.start_instance(this.config_provider.vlc_initial_volume)
    }

    public async onApplicationShutdown (_signal?: string): Promise<void> {
        return this.connector.stop_instance()
    }

    public async get_meta_information (): Promise<ControlInformation> {
        return {
            pid: this.connector.get_vlc_pid(),
            version: this.connector.get_vlc_version(),
        }
    }

    public async get_channel_key (): Promise<string> {
        const filename = await this.connector.get_title()
        const matches = /^(?:.+)\?([a-z0-9]+)$/.exec(filename)

        if (!matches) {
            throw new ControlError('Could not parse channel key from title')
        }

        return matches[1]
    }

    public async play (url: string): Promise<void> {
        return this.connector.add(url)
    }

    public async stop (): Promise<void> {
        return this.connector.stop_instance()
    }

    public async is_playing (): Promise<boolean> {
        return this.connector.is_playing()
    }
}
