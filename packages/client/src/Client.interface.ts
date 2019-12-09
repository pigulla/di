import {
    ChannelDTO,
    ChannelFilterDTO,
    NowPlayingDTO,
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
    get_favorites (): Promise<ChannelDTO[]>
    get_channels (): Promise<ChannelDTO[]>
    get_channel (channel_key: string): Promise<ChannelDTO>
    get_channel_filters (): Promise<ChannelFilterDTO[]>
    get_now_playing (): Promise<Map<string, NowPlayingDTO>>
    get_now_playing (channel_key: string): Promise<NowPlayingDTO>
    get_now_playing (channel_key?: string): Promise<NowPlayingDTO|Map<string, NowPlayingDTO>>
}
