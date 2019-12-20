import {Module} from '@nestjs/common'

import {AppDataProvider, DigitallyImported} from '../../infrastructure/di'

import {UtilityModule} from './utility.module'

@Module({
    imports: [
        UtilityModule,
    ],
    controllers: [],
    providers: [
        {
            provide: 'IAppDataProvider',
            useClass: AppDataProvider,
        },
        {
            provide: 'IDigitallyImported',
            useClass: DigitallyImported,
        },
    ],
    exports: [
        'IAppDataProvider',
        'IDigitallyImported',
    ],
})
export class DigitallyImportedModule {}
