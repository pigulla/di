type OnAirProperties = {
    channel_id: number
    channel_key: string
    artist: string
    title: string
}

export class OnAirDTO {
    public channel_id!: number
    public channel_key!: string
    public artist!: string
    public title!: string

    public static create(properties: OnAirProperties): OnAirDTO {
        return Object.assign(new OnAirDTO(), properties)
    }
}
