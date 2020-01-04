type OnAirProperties = {
    channel_id: number
    channel_key: string
    artist: string
    title: string
}

export class OnAirDTO {
    channel_id!: number
    channel_key!: string
    artist!: string
    title!: string

    public static create (properties: OnAirProperties): OnAirDTO {
        return Object.assign(new OnAirDTO(), properties)
    }
}
