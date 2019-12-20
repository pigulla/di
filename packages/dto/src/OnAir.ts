type OnAirProperties = {
    channel_id: number
    channel_key: string
    display_artist: string
    display_title: string
}

export class OnAirDTO {
    channel_id!: number
    channel_key!: string
    display_artist!: string
    display_title!: string

    public static create (properties: OnAirProperties): OnAirDTO {
        return Object.assign(new OnAirDTO(), properties)
    }
}
