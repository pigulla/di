import {Class} from 'type-fest'
import yargs from 'yargs'

import {Client} from '@digitally-imported/client'

import {blocklet} from './blocklet'
import {BlockletOutput} from './i3.interface'
import {yargs_options} from './yargs_options'

export interface Options {
    auto_exit: boolean
    enable_env: boolean
    yargs_parser: typeof yargs
    client_ctor: Class<Client>
    blocklet_fn: typeof blocklet
}

const default_options: Options = {
    auto_exit: true,
    enable_env: true,
    yargs_parser: yargs,
    client_ctor: Client,
    blocklet_fn: blocklet,
}

export async function cli(
    argv: string[],
    /* istanbul ignore next */
    options: Options = default_options
): Promise<BlockletOutput> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const {auto_exit, enable_env, client_ctor: ClientCtor, blocklet_fn, yargs_parser} = options

    const {endpoint} = yargs_parser
        .exitProcess(auto_exit)
        // @ts-ignore
        .env(enable_env ? 'DI_' : false)
        .scriptName('di-i3-blocklet')
        .options(yargs_options)
        .help()
        .parse(argv)

    const client = new ClientCtor({endpoint})

    return blocklet_fn(client)
}
