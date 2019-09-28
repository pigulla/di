import {sync as which} from 'which';

import {Config, config_schema} from '../configuration';

export class ConfigError extends Error {};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IConfigProvider extends Config {};

export class ConfigProvider implements IConfigProvider {
    public readonly server: IConfigProvider['server'];
    public readonly digitally_imported: IConfigProvider['digitally_imported'];
    public readonly vlc: IConfigProvider['vlc'];

    public constructor (config: any) {
        const {value, error} = config_schema.validate<IConfigProvider>(config);

        if (error) {
            // The config service is instantiated before the logger service (because it depends on it) so we have to
            // manually create some output here.
            const config_error = new ConfigError(`Validation error: ${error.message}`);
            console.error(config_error);
            throw config_error;
        }

        this.server = value.server;
        this.digitally_imported = Object.assign(
            {credentials: null, listen_key: null},
            value.digitally_imported
        );
        this.vlc = Object.assign(
            value.vlc,
            value.vlc.path === null ? {path: which('vlc')} : {}
        );
    }
}
