import joi from '@hapi/joi'
import {O} from 'ts-toolbelt'
import {LogLevel} from '@nestjs/common'

export type Config = O.Readonly<{
    server: {
        host: string
        port: number
        loglevel: LogLevel
        logformat: 'json'|'pretty'
    }
    vlc: {
        path: string
        timeout: number
        initial_volume: number|null
    }
    digitally_imported: {
        url: string
        credentials: {
            email: string
            password: string
        }|null
        listen_key: string|null
    }
}, any, 'deep'>;

export const config_schema = joi.object().keys({
    server: joi.object().keys({
        host: joi.string().hostname().optional().default('localhost'),
        port: joi.number().integer().min(0).max(65535).optional().default(4979),
        loglevel: joi.string().allow('log', 'error', 'warn', 'debug', 'verbose').optional().default('warn'),
        logformat: joi.string().allow('json', 'pretty').optional().default('pretty'),
    }).options({presence: 'required'}),
    vlc: joi.object().keys({
        path: joi.string().min(1).allow(null).optional().default(null),
        timeout: joi.number().integer().positive().optional().default(1000).unit('milliseconds'),
        initial_volume: joi.number().min(0).max(1.25).allow(null).optional().default(0.5),
    }).options({presence: 'required'}),
    digitally_imported: joi.object().keys({
        url: joi.string().uri({scheme: 'https'}).optional().default('https://www.di.fm'),
        credentials: joi.object().keys({
            email: joi.string().email(),
            password: joi.string().min(1),
        }).optional().options({presence: 'required'}),
        listen_key: joi.string().hex().length(16).optional(),
    }).xor('credentials', 'listen_key').options({presence: 'required'}),
}).options({presence: 'required'})
