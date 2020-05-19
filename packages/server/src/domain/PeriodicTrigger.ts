import {Inject, Injectable, OnModuleDestroy, OnModuleInit, Scope} from '@nestjs/common'

import {ILogger} from './Logger.interface'
import {IPeriodicTrigger} from './PeriodicTrigger.interface'

export type Options = {
    log_id: string
    callback: Function
    scope?: any
    interval_ms: number
}

@Injectable({scope: Scope.TRANSIENT})
export class PeriodicTrigger implements IPeriodicTrigger, OnModuleInit, OnModuleDestroy {
    private readonly logger: ILogger
    private readonly options: Options
    private interval_id: NodeJS.Timer | null

    public constructor(@Inject('ILogger') logger: ILogger, options: Options) {
        this.logger = logger.child_for_service(`${PeriodicTrigger.name}/${options.log_id}`)
        this.options = Object.assign({scope: null}, options)
        this.interval_id = null

        this.logger.debug('Service instantiated')
    }

    public onModuleInit(): void {
        this.start()
    }

    public onModuleDestroy(): void {
        this.stop()
    }

    public is_running(): boolean {
        return this.interval_id !== null
    }

    public start(): void {
        if (this.interval_id !== null) {
            return
        }

        this.logger.debug('Starting service')
        this.interval_id = this.schedule()
    }

    public stop(): void {
        if (this.interval_id === null) {
            return
        }

        this.logger.debug('Stopping service')
        clearTimeout(this.interval_id)
        this.interval_id = null
    }

    private schedule(): NodeJS.Timer {
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
