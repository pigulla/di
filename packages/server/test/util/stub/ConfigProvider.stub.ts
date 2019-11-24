import merge from 'lodash.merge'

import {IConfigProvider, LogLevel} from '@server/service'
import {Quality} from '@server/service/di'

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
}

export function create_config_provider_stub (overrides: Partial<IConfigProvider> = {}): IConfigProvider {
    return merge({}, default_config, overrides)
}
