import {Module} from '@nestjs/common'

import {
    AppDataProvider,
    ChannelProvider,
    ListenKeyProvider,
    UserProvider,
} from '../service/'
import {MiscModule} from './misc.module'
import {ConnectorModule} from './connector.module'

@Module({
    imports: [
        MiscModule,
        ConnectorModule,
    ],
    controllers: [],
    providers: [
        {
            provide: 'IAppDataProvider',
            useClass: AppDataProvider,
        },
        {
            provide: 'IUserProvider',
            useClass: UserProvider,
        },
        {
            provide: 'IListenKeyProvider',
            useClass: ListenKeyProvider,
        },
        {
            provide: 'IChannelProvider',
            useClass: ChannelProvider,
        },
    ],
    exports: [
        'IAppDataProvider',
        'IUserProvider',
        'IListenKeyProvider',
        'IChannelProvider',
    ],
})
export class AppDataModule {}
