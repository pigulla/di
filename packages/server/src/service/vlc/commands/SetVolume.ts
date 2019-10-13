import {NoResultVlcCommand} from '../VlcCommand'
import {volume_from_percentage} from './index'

/**
 * Sets the volume in VLC to the given value.
 *
 * Apparently VLC needs some time to "accept" the change, i.e. running the GetVolume command immediately after the
 * SetValue command will most likely not yer return the new value.
 */
export default class VolumeSet extends NoResultVlcCommand<[number]> {
    public constructor () {
        super({command: 'volume'})
    }

    public build_arg_string (args: [number]): string {
        const percentage = volume_from_percentage(args[0])

        return String(percentage)
    }
}
