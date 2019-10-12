import read_pkg, {NormalizedPackageJson} from 'read-pkg'
import {Module, NestModule, MiddlewareConsumer} from '@nestjs/common'

import {
    AppDataProvider,
    ChannelProvider,
    ConfigProvider,
    DigitallyImported,
    IAppDataProvider,
    IConfigProvider,
    IDigitallyImported,
    IVlcControl,
    ListenKeyProvider,
    UserProvider,
    VlcControl,
    Logger,
    ILogger,
} from './service/'
import {
    ChannelFiltersController,
    ChannelsController,
    FavoritesController,
    PlaybackController,
    ServerController,
    UserController,
    VolumeController,
} from './controller/'
import {AppVersionHeader, VlcInstanceMonitor} from './middleware'

@Module({
    imports: [],
    controllers: [
        ChannelsController,
        ChannelFiltersController,
        FavoritesController,
        PlaybackController,
        ServerController,
        UserController,
        VolumeController,
    ],
    providers: [
        {
            provide: 'IConfigProvider',
            useFactory (): IConfigProvider {
                return new ConfigProvider(process.argv)
            },
        },
        {
            provide: 'NormalizedPackageJson',
            async useFactory (): Promise<NormalizedPackageJson> {
                return read_pkg()
            },
        },
        {
            inject: ['IConfigProvider'],
            provide: 'ILogger',
            useFactory (config_provider: IConfigProvider): ILogger {
                return new Logger(config_provider.log_level)
            },
        },
        {
            provide: 'IDigitallyImported',
            useClass: DigitallyImported,
        },
        {
            provide: 'IUserProvider',
            useClass: UserProvider,
        },
        {
            inject: ['ILogger', 'IDigitallyImported'],
            provide: 'IAppDataProvider',
            async useFactory (logger: ILogger, digitally_imported: IDigitallyImported): Promise<IAppDataProvider> {
                const app_data_provider = new AppDataProvider(logger, digitally_imported)
                await app_data_provider.load_app_data()
                return app_data_provider
            },
        },
        {
            provide: 'IListenKeyProvider',
            useClass: ListenKeyProvider,
        },
        {
            inject: ['ILogger', 'IConfigProvider'],
            provide: 'IVlcControl',
            async useFactory (logger: ILogger, config_provider: IConfigProvider): Promise<IVlcControl> {
                const vlc_control = new VlcControl(logger, config_provider)
                await vlc_control.start_instance()
                return vlc_control
            },
        },
        {
            provide: 'IChannelProvider',
            useClass: ChannelProvider,
        },
    ],
})
export class AppModule implements NestModule {
    public configure (consumer: MiddlewareConsumer): void {
        consumer
            .apply(AppVersionHeader)
            .forRoutes('*')
        consumer
            .apply(VlcInstanceMonitor)
            .forRoutes('*')
    }
}
