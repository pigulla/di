import read_pkg from 'read-pkg'
import Axios from 'axios'

import {ConfigurableClient, ConfigurableOptions} from './ConfigurableClient'

export type Options = Pick<ConfigurableOptions, 'endpoint'|'check_version'>

export class Client extends ConfigurableClient {
    public constructor (options: Options) {
        super({
            check_version: true,
            ...options,
            axios_factory: Axios.create,
            client_version: read_pkg.sync().version,
            process,
        })
    }
}
