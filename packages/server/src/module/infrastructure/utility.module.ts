import read_pkg, {NormalizedPackageJson} from 'read-pkg'
import {Module} from '@nestjs/common'
import {sync as which} from 'which'
import pino from 'pino'

import {ServerProcessProxy} from '../../infrastructure'
import {create_argv_parser, IArgvParser} from '../../infrastructure/config'
import {PinoLogger} from '../../infrastructure/logger'
import {IServerProcessProxy, ILogger, INotificationProvider} from '../../domain'
import {Configuration, NotificationType} from '../../domain/config'
import {
    NodeNotificationProvider,
    NullNotificationProvider,
    LogNotificationProvider,
    StderrNotificationProvider,
} from '../../infrastructure/notification'

@Module({
    imports: [],
    controllers: [],
    providers: [
        {
            provide: 'argv',
            useFactory (): string[] {
                return process.argv
            },
        },
        {
            provide: 'DefaultVlcBinary',
            useFactory (): string|null {
                // TODO: use async method
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
            provide: 'Configuration',
            inject: ['IArgvParser', 'argv'],
            useFactory (argv_parser: IArgvParser, argv: string[]): Configuration {
                return argv_parser(argv)
            },
        },
        {
            provide: 'NormalizedPackageJson',
            async useFactory (): Promise<NormalizedPackageJson> {
                return read_pkg()
            },
        },
        {
            provide: 'IServerProcessProxy',
            useFactory (): IServerProcessProxy {
                return new ServerProcessProxy(process)
            },
        },
        {
            provide: 'ILogger',
            inject: ['Configuration'],
            useFactory (configuration: Configuration): ILogger {
                const root_logger = pino({prettyPrint: true})
                return new PinoLogger(root_logger).set_level(configuration.log_level)
            },
        },
        {
            provide: 'INotificationProvider',
            inject: ['ILogger', 'Configuration'],
            useFactory (logger: ILogger, configuration: Configuration): INotificationProvider {
                switch (configuration.notifications) {
                    case NotificationType.NONE:
                        logger.info('Notifications are not enabled')
                        return new NullNotificationProvider()
                    case NotificationType.CONSOLE:
                        logger.info('Using console for notifications')
                        return new StderrNotificationProvider()
                    case NotificationType.LOGGER:
                        logger.info('Using logger for notifications')
                        return new LogNotificationProvider(logger)
                    case NotificationType.NOTIFIER:
                        if (!NodeNotificationProvider.is_node_notifier_installed()) {
                            logger.warn('Module "node-notifier" not available, disabling notifications')
                            return new NodeNotificationProvider(logger)
                        }

                        logger.info('Using "node-notifier" for notifications')
                        return new NodeNotificationProvider(logger)
                }
            },
        },
    ],
    exports: [
        'Configuration',
        'ILogger',
        'INotificationProvider',
        'IServerProcessProxy',
        'NormalizedPackageJson',
    ],
})
export class UtilityModule {}
