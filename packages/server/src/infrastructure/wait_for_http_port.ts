import wait_port from 'wait-port'

import {IWaitForHttpPort, Options} from './wait_for_http_port.interface'

const wait_for_http_port: IWaitForHttpPort = async function (options: Options): Promise<boolean> {
    return wait_port({
        host: options.host,
        port: options.port,
        interval: options.interval,
        timeout: options.timeout * 10,
        output: 'silent',
    })
}

export {wait_for_http_port}
