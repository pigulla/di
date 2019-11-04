import {ApplicationOptions} from './ApplicationOptions'

export interface IArgvParser {
    (argv: string[]): ApplicationOptions
}
