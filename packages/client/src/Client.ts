import Axios from 'axios'
import read_pkg_up from 'read-pkg-up'
import {SetOptional} from 'type-fest'

import {ConfigurableClient, ConfigurableOptions} from './ConfigurableClient'

export type Options = SetOptional<
    Pick<ConfigurableOptions, 'endpoint' | 'check_version' | 'user_agent'>
>

export class Client extends ConfigurableClient {
    public constructor(options: Options = {}) {
        const pkg = read_pkg_up.sync({cwd: __dirname})
        const version = pkg?.packageJson.version

        if (!version) {
            throw new Error('Could not determine package version')
        }

        super({
            check_version: true,
            user_agent: `di-client/${version}`,
            endpoint: 'https://localhost:4979',
            ...options,
            axios_factory: Axios.create,
            client_version: version,
            process,
        })
    }
}
