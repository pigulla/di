type ChannelProperties = {
    director: string
    description: string
    id: number
    key: string
    name: string
    updated_at: string|null
    created_at: string
    images: {
        default: string
        compact: string
        banner: string|null
    }
}

export class ChannelDTO {
    director!: string
    description!: string
    id!: number
    key!: string
    name!: string
    updated_at!: string|null
    created_at!: string
    images!: {
        default: string
        compact: string
        banner: string|null
    }

    public static create (properties: ChannelProperties): ChannelDTO {
        return Object.assign(new ChannelDTO(), properties)
    }
}
