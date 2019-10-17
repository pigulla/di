import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common'

import {
    DigitallyImported,
    VlcControl,
} from '../service/'
import {MiscModule} from './misc.module'
import {VlcInstanceMonitor} from '../middleware'
import {ChildProcessFacade} from '../service/vlc'

@Module({
    imports: [
        MiscModule,
    ],
    controllers: [],
    providers: [
        {
            provide: 'IDigitallyImported',
            useClass: DigitallyImported,
        },
        {
            provide: 'IVlcControl',
            useClass: VlcControl,
        },
        {
            provide: 'IChildProcessFacade',
            useClass: ChildProcessFacade,
        },
    ],
    exports: [
        'IDigitallyImported',
        'IVlcControl',
    ],
})
export class ConnectorModule implements NestModule {
    public configure (consumer: MiddlewareConsumer): void {
        consumer
            .apply(VlcInstanceMonitor)
            .forRoutes('*')
    }
}
