import read_pkg, {NormalizedPackageJson} from 'read-pkg'
import {Module} from '@nestjs/common'
import {sync as which} from 'which'
import pino from 'pino'

import {ServerProcessProxy} from '../../infrastructure'
import {create_argv_parser, IArgvParser} from '../../infrastructure/config'
import {PinoLogger} from '../../infrastructure/logger'
import {Configuration, NotificationTransport, IServerProcessProxy, ILogger, INotificationProvider} from '../../domain'
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
            provide: 'default_vlc_binary',
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
            inject: ['default_vlc_binary'],
            useFactory (default_vlc_binary: string|null): IArgvParser {
                return create_argv_parser({
                    default_vlc_binary,
                    auto_exit: true,
                })
            },
        },
        {
            provide: 'configuration',
            inject: ['IArgvParser', 'argv'],
            useFactory (argv_parser: IArgvParser, argv: string[]): Configuration {
                return argv_parser(argv)
            },
        },
        {
            provide: 'normalized_package_json',
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
            inject: ['configuration'],
            useFactory (configuration: Configuration): ILogger {
                const root_logger = pino({prettyPrint: true})
                return new PinoLogger(root_logger).set_level(configuration.log_level)
            },
        },
        {
            provide: 'INotificationProvider',
            inject: ['ILogger', 'configuration'],
            useFactory (logger: ILogger, configuration: Configuration): INotificationProvider {
                switch (configuration.notifications) {
                    case NotificationTransport.NONE:
                        logger.info('Notifications are not enabled')
                        return new NullNotificationProvider()
                    case NotificationTransport.CONSOLE:
                        logger.info('Using console for notifications')
                        return new StderrNotificationProvider()
                    case NotificationTransport.LOGGER:
                        logger.info('Using logger for notifications')
                        return new LogNotificationProvider(logger)
                    case NotificationTransport.NOTIFIER:
                        logger.info('Using node-notifier for notifications')
                        return new NodeNotificationProvider(logger)
                }
            },
        },
    ],
    exports: [
        'configuration',
        'ILogger',
        'INotificationProvider',
        'IServerProcessProxy',
        'normalized_package_json',
    ],
})
export class UtilityModule {}
