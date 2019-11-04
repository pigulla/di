import read_pkg, {NormalizedPackageJson} from 'read-pkg'
import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common'
import {sync as which} from 'which'

import {
    IConfigProvider, ConfigProvider,
    ILogger, Logger,
} from '@server/service/'
import {create_argv_parser, IArgvParser} from '../service/config'
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
            provide: 'DefaultVlcBinary',
            useFactory (): string|null {
                try {
                    return which('vlc')
                } catch {
                    return null
                }
            },
        },
        {
            provide: 'IArgvParser',
            inject: ['DefaultVlcBinary'],
            useFactory (default_vlc_binary: string|null): IArgvParser {
                return create_argv_parser({
                    default_vlc_binary,
                    auto_exit: true,
                })
            },
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
            provide: 'ILogger',
            inject: ['IConfigProvider'],
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
