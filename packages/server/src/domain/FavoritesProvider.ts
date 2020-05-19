import {Inject, Injectable} from '@nestjs/common'

import {IChannelsProvider} from './ChannelsProvider.interface'
import {Configuration} from './Configuration'
import {IChannel} from './di'
import {IDigitallyImported} from './DigitallyImported.interface'
import {IFavoritesProvider} from './FavoritesProvider.interface'
import {ILogger} from './Logger.interface'

export class CredentialsUnavailableError extends Error {}

@Injectable()
export class FavoritesProvider implements IFavoritesProvider {
    private readonly channels_provider: IChannelsProvider
    private readonly configuration: Configuration
    private readonly digitally_imported: IDigitallyImported
    private readonly logger: ILogger

    public constructor(
        @Inject('ILogger') logger: ILogger,
        @Inject('IChannelsProvider') channels_provider: IChannelsProvider,
        @Inject('configuration') configuration: Configuration,
        @Inject('IDigitallyImported') digitally_imported: IDigitallyImported
    ) {
        this.logger = logger.child_for_service(FavoritesProvider.name)
        this.configuration = configuration
        this.channels_provider = channels_provider
        this.digitally_imported = digitally_imported

        this.logger.debug('Service instantiated')
    }

    public async get_all(): Promise<IChannel[]> {
        const credentials = this.configuration.di_credentials

        if (!credentials) {
            throw new CredentialsUnavailableError()
        }

        const favorite_keys = await this.digitally_imported.load_favorite_channel_keys(credentials)

        return favorite_keys.map(key => this.channels_provider.get(key))
    }
}
