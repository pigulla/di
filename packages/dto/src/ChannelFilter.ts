type ChannelFilterProperties = {
    channels: number[]
    id: number
    key: string
    meta: boolean
    name: string
}

export class ChannelFilterDTO {
    public channels!: number[]
    public id!: number
    public key!: string
    public meta!: boolean
    public name!: string

    public static create(properties: ChannelFilterProperties): ChannelFilterDTO {
        return Object.assign(new ChannelFilterDTO(), properties)
    }
}
