import {Configuration} from '../../domain/config'

export interface IArgvParser {
    (argv: string[]): Configuration
}
