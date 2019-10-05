import clamp from 'lodash.clamp'

export {default as Add} from './Add'
export {default as GetVolume} from './GetVolume'
export {default as IsPlaying} from './IsPlaying'
export {default as Play} from './Play'
export {default as Shutdown} from './Shutdown'
export {default as SetVolume} from './SetVolume'
export {default as Status} from './Status'
export {default as Stop} from './Stop'

export function volume_from_percentage (percent: number): number {
    return clamp(percent, 0, 1.25) * 256
}

// Return the volume as a percentage between 0 and 1.25 (as in VLC's GUI).
export function volume_to_percentage (volume: number): number {
    return clamp(volume / 256, 0, 1.25)
}
