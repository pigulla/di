import {JsonValue} from 'type-fest'

export interface ServerStatusDTO {
    playback_control: {
        pid: number
        [key: string]: JsonValue
    }
    digitally_imported: {
        app_version: string
        deploy_time: string
    }
    server: {
        last_updated: string
        version: string
    }
}
