import {Module} from '@nestjs/common'

import {
    AppDataProvider,
    ChannelsProvider,
    FavoritesProvider,
    IDigitallyImported, DigitallyImported,
    INowPlayingProvider, NowPlayingProvider,
    IPeriodicTrigger, PeriodicTrigger,
} from '@src/service'
import {ILogger} from '@src/service/logger'
import {UtilityModule} from './utility.module'

@Module({
    imports: [
        UtilityModule,
    ],
    controllers: [],
    providers: [
        {
            provide: 'IDigitallyImported',
            useClass: DigitallyImported,
        },
        {
            provide: 'IAppDataProvider',
            useClass: AppDataProvider,
        },
        {
            provide: 'IChannelsProvider',
            useClass: ChannelsProvider,
        },
        {
            provide: 'IFavoritesProvider',
            useClass: FavoritesProvider,
        },
        {
            inject: ['ILogger', 'INowPlayingProvider', 'IDigitallyImported'],
            provide: 'IPeriodicNowPlayingUpdater',
            async useFactory (
                logger: ILogger,
                now_playing_provider: INowPlayingProvider,
                digitally_imported: IDigitallyImported,
            ): Promise<IPeriodicTrigger> {
                return new PeriodicTrigger(logger, {
                    interval_ms: 10_000,
                    async callback (): Promise<void> {
                        const data = await digitally_imported.load_now_playing()

                        now_playing_provider.update(data)
                    },
                })
            },
        },
        {
            inject: ['ILogger', 'IDigitallyImported'],
            provide: 'INowPlayingProvider',
            async useFactory (logger: ILogger, digitally_imported: IDigitallyImported): Promise<INowPlayingProvider> {
                const now_playing_provider = new NowPlayingProvider(logger)
                const data = await digitally_imported.load_now_playing()

                now_playing_provider.update(data)
                return now_playing_provider
            },
        },
    ],
    exports: [
        'IAppDataProvider',
        'IChannelsProvider',
        'IFavoritesProvider',
        'INowPlayingProvider',
    ],
})
export class DigitallyImportedModule {}
