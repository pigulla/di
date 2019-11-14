import {spawn} from 'child_process'

import {Injectable, OnModuleInit, OnApplicationShutdown, Inject} from '@nestjs/common'

import {IConfigProvider, ILogger, IPlaybackControl, ControlInformation} from '@server/service'

import {IConnector} from './Connector.interface'
import {IChildProcessFacade, ChildProcessFacadeCtor} from './ChildProcessFacade.interface'
import {Channel} from '@server/service/di'

type ConnectorCtor = new (child_process_facade: IChildProcessFacade, logger: ILogger) => IConnector

@Injectable()
export class VlcControl implements IPlaybackControl, OnModuleInit, OnApplicationShutdown {
    private readonly logger: ILogger
    private readonly config_provider: IConfigProvider
    private readonly connector: IConnector

    public constructor (
        @Inject('ILogger') logger: ILogger,
        @Inject('IConfigProvider') config_provider: IConfigProvider,
        @Inject('ChildProcessFacadeCtor') ChildProcessFacade: ChildProcessFacadeCtor,
        @Inject('ConnectorCtor') Connector: ConnectorCtor,
    ) {
        const child_process_facade = new ChildProcessFacade(
            config_provider.vlc_path,
            config_provider.vlc_timeout,
            spawn,
        )

        this.logger = logger.child_for_service(VlcControl.name)
        this.config_provider = config_provider
        this.connector = new Connector(child_process_facade, this.logger)

        this.logger.debug('Service instantiated')
    }

    public async onModuleInit (): Promise<void> {
        this.logger.debug('Starting service')

        return this.connector.start_instance(this.config_provider.vlc_initial_volume)
    }

    public async onApplicationShutdown (_signal?: string): Promise<void> {
        this.logger.debug('Stopping service')

        return this.connector.stop_instance()
    }

    public async get_meta_information (): Promise<ControlInformation> {
        return {
            pid: this.connector.get_vlc_pid(),
            version: this.connector.get_vlc_version(),
        }
    }

    public async get_current_channel_key (): Promise<string|null> {
        const {new_input} = await this.connector.get_status()

        return new_input ? Channel.get_key_from_url(new_input) : null
    }

    public async play (url: string): Promise<void> {
        return this.connector.add(url)
    }

    public async stop (): Promise<void> {
        return this.connector.stop()
    }

    public async is_playing (): Promise<boolean> {
        return this.connector.is_playing()
    }

    public async get_volume (): Promise<number> {
        return this.connector.get_volume()
    }

    public async set_volume (volume: number): Promise<void> {
        return this.connector.set_volume(volume)
    }
}
