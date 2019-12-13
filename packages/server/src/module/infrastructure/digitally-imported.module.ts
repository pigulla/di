import {Module} from '@nestjs/common'

import {ChannelsProvider, FavoritesProvider} from '../../domain'
import {AppDataProvider, DigitallyImported} from '../../infrastructure/di'

import {UtilityModule} from './utility.module'

@Module({
    imports: [
        UtilityModule,
    ],
    controllers: [],
    providers: [
        {
            provide: 'IAppDataProvider',
            useClass: AppDataProvider,
        },
        {
            provide: 'IChannelsProvider',
            useClass: ChannelsProvider,
        },
        {
            provide: 'IDigitallyImported',
            useClass: DigitallyImported,
        },
        {
            provide: 'IFavoritesProvider',
            useClass: FavoritesProvider,
        },
    ],
    exports: [
        'IAppDataProvider',
        'IChannelsProvider',
        'IDigitallyImported',
        'IFavoritesProvider',
    ],
})
export class DigitallyImportedModule {}
