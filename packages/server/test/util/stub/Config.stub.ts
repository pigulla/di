import merge from 'lodash.merge'

import {LogLevel} from '@src/domain'
import {Quality} from '@src/domain/di'
import {Configuration, NotificationType} from '@src/domain/config'

export const default_config: Configuration = {
    server_hostname: 'localhost',
    server_port: 4979,

    log_level: LogLevel.WARN,
    playback_state_check_frequency_ms: 2_500,
    notifications: NotificationType.NONE,

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

export function create_config_stub (overrides: Partial<Configuration> = {}): Configuration {
    return merge({}, default_config, overrides)
}
