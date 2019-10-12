import {User} from './di/'

export interface IUserProvider {
    get_user (): User
}
