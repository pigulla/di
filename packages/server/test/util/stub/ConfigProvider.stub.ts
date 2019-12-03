import merge from 'lodash.merge'

import {IConfigProvider} from '@server/service'
import {Quality} from '@server/service/di'
import {LogLevel} from '@server/service/logger'

export const default_config: IConfigProvider = {
    server_hostname: 'localhost',
    server_port: 4979,

    log_level: LogLevel.WARN,

    vlc_path: '/dev/null',
    vlc_timeout: 1000,
    vlc_initial_volume: 0.5,

    di_url: 'https://di.fm.local',
    di_listenkey: 'listen-key',
    di_frequency_ms: 5_000,
    di_quality: Quality.AAC_128,
    di_credentials: {
        username: 'user@example.local',
        password: '53cr37',
    },
}

export function create_config_provider_stub (overrides: Partial<IConfigProvider> = {}): IConfigProvider {
    return merge({}, default_config, overrides)
}
