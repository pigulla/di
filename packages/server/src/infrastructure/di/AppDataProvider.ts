import {Inject, Injectable, OnModuleInit} from '@nestjs/common'
import dayjs, {Dayjs} from 'dayjs'
import {Subject} from 'rxjs'

import {ILogger, IDigitallyImported, IAppDataProvider} from '../../domain'

import {AppData} from './AppData'

@Injectable()
export class AppDataProvider extends Subject<AppData> implements IAppDataProvider, OnModuleInit {
    private readonly digitally_imported: IDigitallyImported
    private readonly logger: ILogger
    private last_update_at: Dayjs | null
    private app_data: AppData | null

    public constructor(
        @Inject('ILogger') logger: ILogger,
        @Inject('IDigitallyImported') digitally_imported: IDigitallyImported
    ) {
        super()

        this.logger = logger.child_for_service(AppDataProvider.name)
        this.digitally_imported = digitally_imported
        this.app_data = null
        this.last_update_at = null

        this.logger.debug('Service instantiated')
    }

    public async onModuleInit(): Promise<void> {
        await this.load_app_data()
    }

    public last_updated_at(): Dayjs {
        if (!this.last_update_at) {
            throw new Error('Provider not initialized')
        }

        return this.last_update_at
    }

    public get_app_data(): AppData {
        if (!this.app_data) {
            throw new Error('AppData not available')
        }

        return this.app_data
    }

    public async load_app_data(): Promise<void> {
        this.app_data = await this.digitally_imported.load_app_data()
        this.last_update_at = dayjs()

        this.logger.debug('App data retrieved')
        this.next(this.get_app_data())
    }
}
