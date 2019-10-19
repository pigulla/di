import {Module} from '@nestjs/common'

import {AppDataProvider, ChannelProvider} from '../service/'
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
            provide: 'IChannelProvider',
            useClass: ChannelProvider,
        },
    ],
    exports: [
        'IAppDataProvider',
        'IChannelProvider',
    ],
})
export class AppDataModule {}
