import {UserDTO} from '@digitally-imported/dto';
import {Controller, Get, Inject, UseInterceptors, ClassSerializerInterceptor} from '@nestjs/common';

import {IUserProvider} from '../service';
import {user_to_dto} from './dto/User.dto';

@Controller('/user')
export class UserController {
    private readonly user_provider: IUserProvider;

    constructor (
        @Inject('IUserProvider') user_provider: IUserProvider,
    ) {
        this.user_provider = user_provider;
    }

    @Get()
    @UseInterceptors(ClassSerializerInterceptor)
    get_user (): Partial<UserDTO> {
        const user = this.user_provider.get_user();

        return user_to_dto(user);
    }
}
