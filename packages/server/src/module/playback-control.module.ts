import {spawn} from 'child_process'
import {randomBytes} from 'crypto'

import {Module} from '@nestjs/common'
import get_port from 'get-port'

import {UtilityModule} from './utility.module'
import {VlcChildProcessFacade, VlcHttpControl, VlcHttpClient, VlcHttpConnection} from '@server/service/playback/vlc'
import {IConfigProvider} from '@server/service'

@Module({
    imports: [
        UtilityModule,
    ],
    controllers: [],
    providers: [
        {
            provide: 'vlc_http_connection',
            async useFactory (): Promise<VlcHttpConnection> {
                return {
                    hostname: 'localhost',
                    port: await get_port(),
                    password: randomBytes(16).toString('hex'),
                }
            },
        },
        {
            provide: 'vlc_child_process',
            inject: ['IConfigProvider', 'vlc_http_connection'],
            useFactory (
                config_provider: IConfigProvider,
                vlc_http_connection: VlcHttpConnection,
            ): VlcChildProcessFacade {
                return new VlcChildProcessFacade(
                    config_provider.vlc_path,
                    config_provider.vlc_timeout,
                    spawn,
                    vlc_http_connection,
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
    exports: [
        'IPlaybackControl',
    ],
})
export class PlaybackControlModule {}
