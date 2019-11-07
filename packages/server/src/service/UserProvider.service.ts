import {Inject} from '@nestjs/common';

import {User} from './di/';
import {IAppDataProvider} from './AppDataProvider.service';

export interface IUserProvider {
    get_user (): User;
}

export class UserProvider implements IUserProvider {
    private readonly app_data_provider: IAppDataProvider;

    public constructor (
        @Inject('IAppDataProvider') app_data_provider: IAppDataProvider
    ) {
        this.app_data_provider = app_data_provider;
    }

    public get_user (): User {
        return this.app_data_provider.get_app_data().user;
    }
}
