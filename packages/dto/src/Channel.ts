type ChannelProperties = {
    director: string
    description: string
    id: number
    key: string
    name: string
    updated_at: string | null
    created_at: string
    images: {
        default: string
        compact: string
        banner: string | null
    }
}

export class ChannelDTO {
    public director!: string
    public description!: string
    public id!: number
    public key!: string
    public name!: string
    public updated_at!: string | null
    public created_at!: string
    public images!: {
        default: string
        compact: string
        banner: string | null
    }

    public static create(properties: ChannelProperties): ChannelDTO {
        return Object.assign(new ChannelDTO(), properties)
    }
}
