import {Inject} from '@nestjs/common'

import {User} from './di/'
import {IAppDataProvider} from './AppDataProvider.service'
import {ILogger} from './Logger.service'

export interface IUserProvider {
    get_user (): User
}

export class UserProvider implements IUserProvider {
    private readonly app_data_provider: IAppDataProvider
    private readonly logger: ILogger

    public constructor (
        @Inject('ILogger') logger: ILogger,
        @Inject('IAppDataProvider') app_data_provider: IAppDataProvider
    ) {
        this.app_data_provider = app_data_provider
        this.logger = logger.for_service(UserProvider.name)

        this.logger.log('Service instantiated')
    }

    public get_user (): User {
        return this.app_data_provider.get_app_data().user
    }
}
