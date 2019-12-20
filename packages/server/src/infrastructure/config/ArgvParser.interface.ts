import {Configuration} from '../../domain'

export interface IArgvParser {
    (argv: string[]): Configuration
}
