import read_pkg, {NormalizedPackageJson} from 'read-pkg'
import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common'
import {sync as which} from 'which'
import pino from 'pino'

import {AppVersionHeader} from '../middleware'
import {ConfigProvider, IConfigProvider, IServerProcessProxy, ServerProcessProxy} from '../service'
import {create_argv_parser, IArgvParser, NotificationService} from '../service/config'
import {ILogger, PinoLogger} from '../service/logger'
import {INotifier, LoggerNotifier, NodeNotifier, NullNotifier, StderrNotifier} from '../service/notifier'

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
        {
            provide: 'INotifier',
            inject: ['ILogger', 'IConfigProvider'],
            useFactory (logger: ILogger, config_provider: IConfigProvider): INotifier {
                switch (config_provider.notifications) {
                    case NotificationService.NONE:
                        logger.info('Notifications are not enabled')
                        return new NullNotifier()
                    case NotificationService.CONSOLE:
                        logger.info('Using console for notifications')
                        return new StderrNotifier()
                    case NotificationService.LOGGER:
                        logger.info('Using logger for notifications')
                        return new LoggerNotifier(logger)
                    case NotificationService.NOTIFIER:
                        if (!NodeNotifier.is_node_notifier_installed()) {
                            logger.warn('Module "node-notifier" not available, disabling notifications')
                            return new NullNotifier()
                        }

                        logger.info('Using "node-notifier" for notifications')
                        return new NodeNotifier(logger)
                }
            },
        },
    ],
    exports: [
        'IConfigProvider',
        'ILogger',
        'IServerProcessProxy',
        'NormalizedPackageJson',
        'INotifier',
    ],
})
export class UtilityModule implements NestModule {
    public configure (consumer: MiddlewareConsumer): void {
        consumer
            .apply(AppVersionHeader)
            .forRoutes('*')
    }
}
