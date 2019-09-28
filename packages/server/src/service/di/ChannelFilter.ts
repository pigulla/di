export interface RawChannelFilter {
    channels: number[];
    display: boolean;
    id: number;
    key: string;
    meta: boolean;
    name: string;
    network_id: number;
    position: number;
}

export class ChannelFilter {
    // eslint-disable-next-line no-useless-constructor
    public constructor (
        public readonly channels: Set<number>,
        public readonly display: boolean,
        public readonly id: number,
        public readonly key: string,
        public readonly meta: boolean,
        public readonly name: string,
        public readonly position: number
    ) {}

    public static from_raw (data: RawChannelFilter): ChannelFilter {
        return new ChannelFilter(
            new Set(data.channels),
            data.display,
            data.id,
            data.key,
            data.meta,
            data.name,
            data.position
        );
    }
}
