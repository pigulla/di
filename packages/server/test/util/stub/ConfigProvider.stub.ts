import {O} from 'ts-toolbelt'
import joi from '@hapi/joi'
import merge from 'lodash.merge'

import {IConfigProvider} from '../../../src/service'
import {Config, config_schema} from '../../../src/configuration'

type WriteableConfig = O.Writable<Config, keyof Config, 'deep'>

export type ConfigOverrides = O.Optional<WriteableConfig, keyof Config, 'deep'>

export const default_config: WriteableConfig = {
    server: {
        host: 'localhost',
        port: 4979,
        loglevel: 'warn',
        logformat: 'pretty',
    },
    vlc: {
        path: '/dev/null',
        timeout: 1000,
        initial_volume: 0.5,
    },
    digitally_imported: {
        url: 'https://di.fm.local',
        credentials: {
            email: 'user@example.com',
            password: '53cr37',
        },
        listen_key: null,
    },
}

export function create_config_provider_stub (overrides: ConfigOverrides = {}): IConfigProvider {
    const config = merge({}, default_config, overrides)

    if (config.digitally_imported.listen_key) {
        delete config.digitally_imported.credentials
    } else {
        delete config.digitally_imported.listen_key
    }

    joi.attempt(config, config_schema)

    return config
}
