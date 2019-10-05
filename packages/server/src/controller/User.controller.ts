import {UserDTO} from '@digitally-imported/dto'
import {Controller, Get, Inject, UseInterceptors, ClassSerializerInterceptor} from '@nestjs/common'

import {IUserProvider} from '../service'

@Controller('/user')
export class UserController {
    private readonly user_provider: IUserProvider;

    public constructor (
        @Inject('IUserProvider') user_provider: IUserProvider,
    ) {
        this.user_provider = user_provider
    }

    @Get()
    @UseInterceptors(ClassSerializerInterceptor)
    public get_user (): Partial<UserDTO> {
        const user = this.user_provider.get_user()

        return user.to_dto()
    }
}
