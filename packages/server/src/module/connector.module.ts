import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common'

import {
    DigitallyImported, IDigitallyImported, INowPlayingProvider, NowPlayingProvider,
    VlcControl,
    ILogger, IPeriodicTrigger, PeriodicUpdater,
} from '../service/'
import {MiscModule} from './misc.module'
import {VlcInstanceMonitor} from '../middleware'
import {ChildProcessFacade} from '../service/vlc'

@Module({
    imports: [
        MiscModule,
    ],
    controllers: [],
    providers: [
        {
            provide: 'IDigitallyImported',
            useClass: DigitallyImported,
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
        {
            inject: ['ILogger', 'INowPlayingProvider', 'IDigitallyImported'],
            provide: 'IPeriodicNowPlayingUpdater',
            async useFactory (
                logger: ILogger,
                now_playing_provider: INowPlayingProvider,
                digitally_imported: IDigitallyImported,
            ): Promise<IPeriodicTrigger> {
                const periodic_updater = new PeriodicUpdater(logger, {
                    interval_ms: 10_000,
                    async callback (): Promise<void> {
                        const data = await digitally_imported.load_now_playing()

                        now_playing_provider.update(data)
                    },
                })

                periodic_updater.start()
                return periodic_updater
            },
        },
        {
            provide: 'IVlcControl',
            useClass: VlcControl,
        },
        {
            provide: 'IChildProcessFacade',
            useClass: ChildProcessFacade,
        },
    ],
    exports: [
        'IDigitallyImported',
        'INowPlayingProvider',
        'IVlcControl',
    ],
})
export class ConnectorModule implements NestModule {
    public configure (consumer: MiddlewareConsumer): void {
        consumer
            .apply(VlcInstanceMonitor)
            .forRoutes('*')
    }
}
