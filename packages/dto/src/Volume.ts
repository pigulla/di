type VolumeProperties = {
    volume: number
}

export class VolumeDTO {
    volume!: number

    public static create (properties: VolumeProperties): VolumeDTO {
        return Object.assign(new VolumeDTO(), properties)
    }
}
