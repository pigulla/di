export interface ServerStatusDTO {
    vlc: {
        version: string
        pid: number
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
