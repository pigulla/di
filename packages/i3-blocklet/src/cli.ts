import {Class} from 'type-fest'

import {Client} from '@digitally-imported/client'

import {blocklet} from './blocklet'
import {BlockletOutput} from './i3.interface'
import {yargs} from './yargs'

export interface Options {
    auto_exit: boolean
    client_ctor: Class<Client>
    blocklet_fn: typeof blocklet
}

const default_options: Options = {
    auto_exit: true,
    client_ctor: Client,
    blocklet_fn: blocklet,
}

export async function cli(
    argv: string[],
    /* istanbul ignore next */
    options: Options = default_options
): Promise<BlockletOutput> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const {auto_exit, client_ctor: ClientCtor, blocklet_fn} = options
    const {endpoint} = yargs.exitProcess(auto_exit).parse(argv)
    const client = new ClientCtor({endpoint})

    return blocklet_fn(client)
}
