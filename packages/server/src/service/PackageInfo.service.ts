import read_pkg, {NormalizedPackageJson} from 'read-pkg';
import {Inject} from '@nestjs/common';

import {ILogger} from './Logger.service';

export interface IPackageInfo {
    readonly package_json: NormalizedPackageJson;
}

export class PackageInfo implements IPackageInfo {
    public readonly package_json: NormalizedPackageJson;
    private readonly logger: ILogger;

    public constructor (
        @Inject('ILogger') logger: ILogger,
    ) {
        this.logger = logger.for_service(PackageInfo.name);
        this.package_json = read_pkg.sync();

        this.logger.log('Service instantiated');
    }
}
