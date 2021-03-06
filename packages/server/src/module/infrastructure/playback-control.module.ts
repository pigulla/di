import {spawn} from 'child_process'
import {randomBytes} from 'crypto'

import {Module} from '@nestjs/common'
import get_port from 'get-port'

import {Configuration, ILogger} from '../../domain'
import {wait_for_http_port} from '../../infrastructure'
import {
    VlcChildProcessFacade,
    VlcHttpControl,
    VlcHttpClient,
    VlcHttpConnection,
} from '../../infrastructure/playback'

import {UtilityModule} from './utility.module'

@Module({
    imports: [UtilityModule],
    controllers: [],
    providers: [
        {
            provide: 'vlc_http_connection',
            async useFactory(): Promise<VlcHttpConnection> {
                return {
                    hostname: 'localhost',
                    port: await get_port(),
                    password: randomBytes(16).toString('hex'),
                }
            },
        },
        {
            provide: 'vlc_child_process',
            inject: ['configuration', 'vlc_http_connection', 'ILogger'],
            useFactory(
                configuration: Configuration,
                vlc_http_connection: VlcHttpConnection,
                logger: ILogger
            ): VlcChildProcessFacade {
                return new VlcChildProcessFacade(
                    configuration.vlc_path,
                    configuration.vlc_timeout,
                    spawn,
                    vlc_http_connection,
                    wait_for_http_port,
                    logger
                )
            },
        },
        {
            provide: 'IVlcHttpClient',
            useClass: VlcHttpClient,
        },
        {
            provide: 'IPlaybackControl',
            useClass: VlcHttpControl,
        },
    ],
    exports: ['IPlaybackControl'],
})
export class PlaybackControlModule {}
