import {Channel} from './di'

export interface IFavoritesProvider {
    get_all (): Promise<Channel[]>
}
