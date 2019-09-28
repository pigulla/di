import {UserDTO} from '@digitally-imported/dto';

import {AuthenticatedUser, PremiumUser, User} from '../../service/di';

export function user_to_dto (user: User): UserDTO {
    const dto = {
        type: user.type,
        authenticated: user.authenticated,
        has_premium: user.has_premium,
        audio_token: user.audio_token,
        session_key: user.session_key,
        has_password: user.has_password,
    };

    if (user instanceof AuthenticatedUser) {
        Object.assign(dto, {
            id: user.id,
            api_key: user.api_key,
            created_at: user.created_at,
            favorites: user.favorites,
        });
    }

    if (user instanceof PremiumUser) {
        Object.assign(dto, {
            listen_key: user.listen_key,
        });
    };

    return new UserDTO(dto);
}
