import {Inject, Injectable} from '@nestjs/common'

import {Channel} from './di'
import {ILogger} from './logger'
import {IFavoritesProvider} from './FavoritesProvider.interface'
import {IDigitallyImported} from '@server/service/DigitallyImported.interface'
import {IConfigProvider} from '@server/service/ConfigProvider.interface'
import {IChannelsProvider} from '@server/service/ChannelsProvider.interface'

export class CredentialsUnavailableError extends Error {}

@Injectable()
export class FavoritesProvider implements IFavoritesProvider {
    private readonly channels_provider: IChannelsProvider
    private readonly config_provider: IConfigProvider
    private readonly digitally_imported: IDigitallyImported
    private readonly logger: ILogger

    public constructor (
        @Inject('ILogger') logger: ILogger,
        @Inject('IChannelsProvider') channels_provider: IChannelsProvider,
        @Inject('IConfigProvider') config_provider: IConfigProvider,
        @Inject('IDigitallyImported') digitally_imported: IDigitallyImported,
    ) {
        this.logger = logger.child_for_service(FavoritesProvider.name)
        this.config_provider = config_provider
        this.channels_provider = channels_provider
        this.digitally_imported = digitally_imported

        this.logger.debug('Service instantiated')
    }

    public async get_all (): Promise<Channel[]> {
        const credentials = this.config_provider.di_credentials

        if (!credentials) {
            throw new CredentialsUnavailableError()
        }

        const favorite_keys = await this.digitally_imported.load_favorite_channel_keys(credentials)

        return favorite_keys.map(key => this.channels_provider.get(key))
    }
}
