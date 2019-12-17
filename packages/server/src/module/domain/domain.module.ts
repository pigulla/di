import {Module} from '@nestjs/common'

import {
    IPlaybackStateProvider, PlaybackStateProvider,
    IPeriodicTrigger, PeriodicTrigger,
    ILogger,
    Notifier, INowPlayingProvider, IDigitallyImported, NowPlayingProvider, ChannelsProvider, FavoritesProvider,
} from '../../domain'
import {Configuration} from '../../domain/config'
import {DigitallyImportedModule, UtilityModule, PlaybackControlModule} from '../infrastructure'

@Module({
    imports: [
        DigitallyImportedModule,
        PlaybackControlModule,
        UtilityModule,
    ],
    controllers: [],
    providers: [
        {
            provide: 'INotifier',
            useClass: Notifier,
        },
        {
            provide: 'IFavoritesProvider',
            useClass: FavoritesProvider,
        },
        {
            inject: ['ILogger', 'configuration', 'IPlaybackStateProvider'],
            provide: 'IPeriodicPlaybackStateUpdater',
            async useFactory (
                logger: ILogger,
                configuration: Configuration,
                playback_state_provider: IPlaybackStateProvider,
            ): Promise<IPeriodicTrigger> {
                return new PeriodicTrigger(logger, {
                    interval_ms: configuration.playback_state_check_frequency_ms,
                    async callback (): Promise<void> {
                        playback_state_provider.trigger_check()
                    },
                })
            },
        },
        {
            provide: 'IPlaybackStateProvider',
            useClass: PlaybackStateProvider,
        },
        {
            inject: ['ILogger', 'configuration', 'INowPlayingProvider', 'IDigitallyImported'],
            provide: 'IPeriodicNowPlayingUpdater',
            async useFactory (
                logger: ILogger,
                configuration: Configuration,
                now_playing_provider: INowPlayingProvider,
                digitally_imported: IDigitallyImported,
            ): Promise<IPeriodicTrigger> {
                return new PeriodicTrigger(logger, {
                    interval_ms: configuration.di_frequency_ms,
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
            async useFactory (
                logger: ILogger,
                digitally_imported: IDigitallyImported,
            ): Promise<INowPlayingProvider> {
                const now_playing_provider = new NowPlayingProvider(logger)
                const data = await digitally_imported.load_now_playing()

                now_playing_provider.update(data)
                return now_playing_provider
            },
        },
        {
            provide: 'IChannelsProvider',
            useClass: ChannelsProvider,
        },
    ],
    exports: [
        'IChannelsProvider',
        'IFavoritesProvider',
        'INowPlayingProvider',
        'IPlaybackStateProvider',
        DigitallyImportedModule,
        PlaybackControlModule,
        UtilityModule,
    ],
})
export class DomainModule {}
