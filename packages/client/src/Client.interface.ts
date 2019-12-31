import {
    ChannelDTO,
    ChannelFilterDTO,
    OnAirDTO,
    PlaybackStateDTO,
    ServerStatusDTO,
} from '@digitally-imported/dto'

export interface IClient {
    is_alive (): Promise<boolean>
    shutdown (): Promise<void>
    get_server_status (): Promise<ServerStatusDTO>
    update (): Promise<void>
    set_volume (value: number): Promise<void>
    get_volume (): Promise<number>
    is_playing (): Promise<boolean>
    start_playback (channel_key: string): Promise<ChannelDTO>
    stop_playback (): Promise<void>
    get_playback_state (): Promise<PlaybackStateDTO|null>
    get_favorites (): Promise<ChannelDTO[]|null>
    get_channels (): Promise<ChannelDTO[]>
    get_channel (channel_key: string): Promise<ChannelDTO>
    get_channel_filters (): Promise<ChannelFilterDTO[]>
    get_on_air (): Promise<Map<string, OnAirDTO>>
    get_on_air (channel_key: string): Promise<OnAirDTO>
    get_on_air (channel_key?: string): Promise<OnAirDTO|Map<string, OnAirDTO>>
}
