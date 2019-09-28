import {Module, NestModule, MiddlewareConsumer} from '@nestjs/common';

import {
    AppDataProvider,
    ChannelProvider,
    ConfigProvider,
    DigitallyImported,
    IAppDataProvider,
    IConfigProvider,
    IDigitallyImported,
    IVlcControl,
    ListenkeyProvider,
    UserProvider,
    PackageInfo,
    VlcControl,
    Logger,
    ILogger,
} from './service/';
import {
    ChannelFiltersController,
    ChannelsController,
    FavoritesController,
    PlaybackController,
    ServerController,
    UserController,
    VolumeController,
} from './controller/';
import {AppVersionHeader, VlcInstanceMonitor} from './middleware';

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
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const config = require('config');
                return new ConfigProvider(config.util.toObject());
            },
        },
        {
            provide: 'IPackageInfo',
            useClass: PackageInfo,
        },
        {
            provide: 'ILogger',
            useClass: Logger,
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
                const app_data_provider = new AppDataProvider(logger, digitally_imported);
                await app_data_provider.load_app_data();
                return app_data_provider;
            },
        },
        {
            provide: 'IListenkeyProvider',
            useClass: ListenkeyProvider,
        },
        {
            inject: ['ILogger', 'IConfigProvider'],
            provide: 'IVlcControl',
            async useFactory (logger: ILogger, config_provider: IConfigProvider): Promise<IVlcControl> {
                const vlc_control = new VlcControl(logger, config_provider.vlc);
                await vlc_control.start_instance();
                return vlc_control;
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
            .forRoutes('*');
        consumer
            .apply(VlcInstanceMonitor)
            .forRoutes('*');
    }
}
