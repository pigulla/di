import {Class} from 'type-fest'
import {Client} from '@digitally-imported/client'

import {blocklet} from './blocklet'
import {BlockletOutput} from './i3.interface'
import {yargs} from './yargs'

export interface Options {
    auto_exit: boolean
    ClientCtor: Class<Client>
    blocklet_fn: typeof blocklet
}

const default_options: Options = {
    auto_exit: false,
    ClientCtor: Client,
    blocklet_fn: blocklet,
}

export async function cli (argv: string[], options: Options = default_options): Promise<BlockletOutput> {
    const {auto_exit, ClientCtor, blocklet_fn} = options
    const {https, hostname, port} = yargs.exitProcess(auto_exit).parse(argv)
    const client = new ClientCtor({
        endpoint: `${https ? 'https' : 'http'}://${hostname}:${port}`,
    })

    return blocklet_fn(client)
}
