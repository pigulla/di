import {Class} from 'type-fest'
import {Client} from '@digitally-imported/client'
import notifier from 'node-notifier'
import {Notification} from 'node-notifier/notifiers/notificationcenter'

import {start_poll, StopFn} from './start_poll'
import {yargs} from './yargs'

export interface Options {
    auto_exit: boolean
    ClientCtor: Class<Client>
    start_poll: typeof start_poll
}

const default_options: Options = {
    auto_exit: false,
    ClientCtor: Client,
    start_poll: start_poll,
}

export async function change_notifier (argv: string[], options: Options = default_options): Promise<StopFn> {
    const {auto_exit, start_poll, ClientCtor} = options
    const {https, hostname, port, interval} = yargs.exitProcess(auto_exit).parse(argv)
    const client = new ClientCtor({
        endpoint: `${https ? 'https' : 'http'}://${hostname}:${port}`,
    })

    function notify (notification: Notification): void {
        notifier.notify(notification)
    }

    return start_poll(client, interval, notify)
}
