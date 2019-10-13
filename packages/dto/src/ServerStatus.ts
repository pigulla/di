export interface ServerStatusDTO {
    vlc: {
        version: string
        pid: number
    }
    digitally_imported: {
        app_version: string
        deploy_time: string
        user_type: 'guest'|'public'|'premium'
    }
    server: {
        last_updated: string
        version: string
    }
}
