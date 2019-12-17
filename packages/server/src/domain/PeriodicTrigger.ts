import {Inject, OnApplicationBootstrap, OnApplicationShutdown} from '@nestjs/common'

import {ILogger} from './Logger.interface'
import {IPeriodicTrigger} from './PeriodicTrigger.interface'

export type Options = {
    callback: Function
    scope?: any
    interval_ms: number
}

export class PeriodicTrigger implements IPeriodicTrigger, OnApplicationBootstrap, OnApplicationShutdown {
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

        this.logger.debug('Service instantiated')
    }

    public onApplicationBootstrap (): void {
        this.start()
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

        this.logger.debug('Starting service')
        this.interval_id = this.schedule()
    }

    public stop (): void {
        if (!this.interval_id) {
            return
        }

        this.logger.debug('Stopping service')
        clearTimeout(this.interval_id)
        this.interval_id = null
    }

    private schedule (): NodeJS.Timer {
        const {callback, scope, interval_ms} = this.options

        return setTimeout(() => {
            Promise.resolve(callback.call(scope))
                .catch(error => this.logger.error(`Update failed: ${error.message}`))
                .then(() => {
                    this.interval_id = this.schedule()
                })
        }, interval_ms)
    }
}
