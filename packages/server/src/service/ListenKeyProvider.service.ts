import {Inject} from '@nestjs/common'

import {PremiumUser} from './di'
import {IAppDataProvider} from './AppDataProvider.interface'
import {IConfigProvider} from './ConfigProvider.interface'
import {ILogger} from './Logger.interface'
import {IListenKeyProvider} from './ListenKeyProvider.interface'

export class ListenKeyProvider implements IListenKeyProvider {
    private readonly app_data_provider: IAppDataProvider;
    private readonly config_provider: IConfigProvider;
    private readonly logger: ILogger;

    public constructor (
        @Inject('ILogger') logger: ILogger,
        @Inject('IConfigProvider') config_provider: IConfigProvider,
        @Inject('IAppDataProvider') app_data_provider: IAppDataProvider,
    ) {
        this.app_data_provider = app_data_provider
        this.config_provider = config_provider
        this.logger = logger.for_service(ListenKeyProvider.name)

        this.logger.log('Service instantiated')
    }

    public get_listen_key (): string {
        const listen_key = this.config_provider.di_listenkey
        const user = this.app_data_provider.get_app_data().user

        if (user instanceof PremiumUser) {
            return (user as PremiumUser).listen_key
        } else if (listen_key) {
            return listen_key
        }

        throw new Error('No listenkey found')
    }
}
