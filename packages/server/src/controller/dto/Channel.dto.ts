import {ChannelDTO} from '@digitally-imported/dto';

import {Channel} from '../../service/di';

export function channel_to_dto (channel: Channel): ChannelDTO {
    return new ChannelDTO({
        director: channel.director,
        created_at: channel.created_at,
        description: channel.description,
        is_favorite: channel.is_favorite,
        id: channel.id,
        key: channel.key,
        name: channel.name,
        updated_at: channel.updated_at,
        images: channel.images,
    });
}
