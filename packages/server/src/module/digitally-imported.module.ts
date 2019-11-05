import {Module} from '@nestjs/common'

import {
    AppDataProvider,
    ChannelProvider,
    IDigitallyImported, DigitallyImported,
    ILogger,
    INowPlayingProvider, NowPlayingProvider,
    IPeriodicTrigger, PeriodicTrigger,
} from '@server/service/'
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
            provide: 'IChannelProvider',
            useClass: ChannelProvider,
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
        'IChannelProvider',
        'INowPlayingProvider',
    ],
})
export class DigitallyImportedModule {}
