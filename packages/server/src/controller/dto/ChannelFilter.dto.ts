import {ChannelFilterDTO} from '@digitally-imported/dto';

import {ChannelFilter} from '../../service/di';

export function channel_filter_to_dto (channel_filter: ChannelFilter): ChannelFilterDTO {
    return new ChannelFilterDTO({
        channels: channel_filter.channels,
        display: channel_filter.display,
        id: channel_filter.id,
        key: channel_filter.key,
        meta: channel_filter.meta,
        name: channel_filter.name,
        position: channel_filter.position,
    });
}
