import dayjs, {Dayjs} from 'dayjs'
import {Inject} from '@nestjs/common'

import {IDigitallyImported} from './DigitallyImported.service'
import {AppData} from './di'
import {ILogger} from './Logger.service'

export type UpdateCallback<T> = (value: T) => void;

export interface UpdateNotifier<T> {
    on_update (callback: UpdateCallback<T>, context?: any): void
}

export interface IAppDataProvider extends UpdateNotifier<AppData> {
    load_app_data (): Promise<IAppDataProvider>
    get_app_data (): AppData
    last_updated_at (): Dayjs
}

export class AppDataProvider implements IAppDataProvider {
    private readonly digitally_imported: IDigitallyImported;
    private readonly logger: ILogger;
    private readonly update_callbacks: Array<[(app_data: AppData) => void, any]>;
    private last_update_at: Dayjs|null;
    private app_data: AppData|null;

    public constructor (
        @Inject('ILogger') logger: ILogger,
        @Inject('IDigitallyImported') digitally_imported: IDigitallyImported,
    ) {
        this.logger = logger.for_service(AppDataProvider.name)
        this.update_callbacks = []
        this.digitally_imported = digitally_imported
        this.app_data = null
        this.last_update_at = null

        this.logger.log('Service instantiated')
    }

    public last_updated_at (): Dayjs {
        if (!this.last_update_at) {
            throw new Error('Provider not initialized')
        }

        return this.last_update_at
    }

    public on_update (callback: (app_data: AppData) => void, context?: any): void {
        this.update_callbacks.push([callback, context])
    }

    public get_app_data (): AppData {
        if (!this.app_data) {
            throw new Error('AppData not available')
        }

        return this.app_data
    }

    public async load_app_data (): Promise<this> {
        this.app_data = await this.digitally_imported.load_app_data()
        this.last_update_at = dayjs()

        this.logger.debug('App data retrieved, notifying listeners')
        this.update_callbacks.forEach(([callback, context]) => callback.call(context, this.get_app_data()))

        return this
    }
}