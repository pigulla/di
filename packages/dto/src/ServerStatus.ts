import {JsonValue} from 'type-fest'

type ServerStatusProperties = {
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

export class ServerStatusDTO {
    public playback_control!: {
        pid: number
        [key: string]: JsonValue
    }

    public digitally_imported!: {
        app_version: string
        deploy_time: string
    }

    public server!: {
        last_updated: string
        version: string
    }

    public static create(properties: ServerStatusProperties): ServerStatusDTO {
        return Object.assign(new ServerStatusDTO(), properties)
    }
}
