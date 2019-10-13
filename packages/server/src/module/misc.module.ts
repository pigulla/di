import read_pkg, {NormalizedPackageJson} from 'read-pkg'
import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common'

import {
    ConfigProvider,
    IConfigProvider,
    Logger,
    ILogger,
} from '../service/'
import {AppVersionHeader} from '../middleware'

@Module({
    imports: [],
    controllers: [],
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
    ],
    exports: [
        'IConfigProvider',
        'NormalizedPackageJson',
        'ILogger',
    ],
})
export class MiscModule implements NestModule {
    public configure (consumer: MiddlewareConsumer): void {
        consumer
            .apply(AppVersionHeader)
            .forRoutes('*')
    }
}
