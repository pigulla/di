import read_pkg, {NormalizedPackageJson} from 'read-pkg'
import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common'
import {sync as which} from 'which'
import pino from 'pino'

import {IConfigProvider, ConfigProvider, ServerProcessProxy, IServerProcessProxy} from '@server/service'
import {ILogger, PinoLogger} from '@server/service/logger'
import {AppVersionHeader} from '@server/middleware'
import {create_argv_parser, IArgvParser} from '../service/config'

@Module({
    imports: [],
    controllers: [],
    providers: [
        {
            provide: 'argv',
            // @ts-ignore
            useFactory (): string[] {
                // @ts-ignore
                return global.process_argv
            },
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
                const root_logger = pino({prettyPrint: true})
                return new PinoLogger(root_logger).set_level(config_provider.log_level)
            },
        },
        {
            provide: 'IServerProcessProxy',
            useFactory (): IServerProcessProxy {
                return new ServerProcessProxy(process)
            },
        },
    ],
    exports: [
        'IConfigProvider',
        'ILogger',
        'IServerProcessProxy',
        'NormalizedPackageJson',
    ],
})
export class UtilityModule implements NestModule {
    public configure (consumer: MiddlewareConsumer): void {
        consumer
            .apply(AppVersionHeader)
            .forRoutes('*')
    }
}
