import {classictechno, progressive, vocaltrance} from './Channel.builder'
import {ambient, bass, deep} from './ChannelFilter.builder'

export * from './AppData.builder'
export {ChannelBuilder} from './Channel.builder'
export {ChannelFilterBuilder} from './ChannelFilter.builder'
export * from './NowPlaying.builder'
export * from './TrackInfo.builder'

export const prebuilt_channel = {
    progressive,
    classictechno,
    vocaltrance,
}

export const prebuilt_channel_filter = {
    ambient,
    bass,
    deep,
}
