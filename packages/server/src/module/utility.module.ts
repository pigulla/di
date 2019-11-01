import read_pkg, {NormalizedPackageJson} from 'read-pkg'
import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common'

import {
    IConfigProvider, ConfigProvider,
    ILogger, Logger,
} from '@server/service/'
import {argv_parser} from '../service/config'
import {AppVersionHeader} from '@server/middleware'

@Module({
    imports: [],
    controllers: [],
    providers: [
        {
            provide: 'argv',
            useValue: process.argv,
        },
        {
            provide: 'IArgvParser',
            useValue: argv_parser,
        },
        {
            provide: 'IConfigProvider',
            useClass: ConfigProvider,
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
export class UtilityModule implements NestModule {
    public configure (consumer: MiddlewareConsumer): void {
        consumer
            .apply(AppVersionHeader)
            .forRoutes('*')
    }
}
