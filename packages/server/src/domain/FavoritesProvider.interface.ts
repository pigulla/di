import {IChannel} from './di'

export interface IFavoritesProvider {
    get_all(): Promise<IChannel[]>
}
