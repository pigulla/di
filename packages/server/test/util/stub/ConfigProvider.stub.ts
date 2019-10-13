import merge from 'lodash.merge'

import {IConfigProvider} from '../../../src/service'

type Config = Omit<IConfigProvider, 'has_credentials'|'has_listenkey'>
export type ConfigOverrides = Partial<Config>

export const default_config: Config = {
    server_hostname: 'localhost',
    server_port: 4979,

    log_level: 'warn',

    vlc_path: '/dev/null',
    vlc_timeout: 1000,
    vlc_initial_volume: 0.5,

    di_url: 'https://di.fm.local',
    di_username: 'user@example.com',
    di_password: '53cr37',
    di_listenkey: null,
}

export function create_config_provider_stub (overrides: ConfigOverrides = {}): IConfigProvider {
    const config: Config = merge({}, default_config, overrides)

    if (config.di_listenkey) {
        config.di_username = null
        config.di_password = null
    } else {
        config.di_listenkey = null
    }

    return config
}
