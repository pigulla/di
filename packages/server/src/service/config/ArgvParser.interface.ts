import {ApplicationOptions} from './ApplicationOptions'

export interface IArgvParser {
    (argv: string[], auto_exit?: boolean): ApplicationOptions
}
