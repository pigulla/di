type PlayProperties = {
    channel: string
}

export class PlayDTO {
    public channel!: string

    public static create(properties: PlayProperties): PlayDTO {
        return Object.assign(new PlayDTO(), properties)
    }
}
