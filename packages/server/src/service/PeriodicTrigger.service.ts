import {Inject, OnApplicationShutdown} from '@nestjs/common'

import {ILogger} from './Logger.interface'
import {IPeriodicTrigger} from './PeriodicTrigger.interface'

export type Options = {
    callback: Function
    scope?: any
    interval_ms: number
}

export class PeriodicTrigger implements IPeriodicTrigger, OnApplicationShutdown {
    private readonly logger: ILogger
    private readonly options: Options
    private interval_id: NodeJS.Timer|null

    public constructor (
        @Inject('ILogger') logger: ILogger,
            options: Options,
    ) {
        this.logger = logger
        this.options = Object.assign({scope: null}, options)
        this.interval_id = null

        this.logger.log('Service instantiated')
    }

    public onApplicationShutdown (_signal?: string): void {
        this.stop()
    }

    public is_running (): boolean {
        return !!this.interval_id
    }

    public start (): void {
        if (this.interval_id) {
            return
        }

        this.logger.log('Starting service')
        this.interval_id = this.schedule()
    }

    public stop (): void {
        if (!this.interval_id) {
            return
        }

        this.logger.log('Stopping service')
        clearTimeout(this.interval_id)
        this.interval_id = null
    }

    private schedule (): NodeJS.Timer {
        const {callback, scope, interval_ms} = this.options

        return setTimeout(() => {
            Promise.resolve(callback.call(scope))
                .catch(error => this.logger.error(`Update failed: ${error.message}`))
                .then(() => this.schedule())
        }, interval_ms)
    }
}
