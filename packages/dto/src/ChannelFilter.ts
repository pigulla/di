type ChannelFilterProperties = {
    channels: number[]
    id: number
    key: string
    meta: boolean
    name: string
}

export class ChannelFilterDTO {
    channels!: number[]
    id!: number
    key!: string
    meta!: boolean
    name!: string

    public static create (properties: ChannelFilterProperties): ChannelFilterDTO {
        return Object.assign(new ChannelFilterDTO(), properties)
    }
}
