import {Injectable, NestMiddleware, Inject} from '@nestjs/common';
import {Request, Response} from 'express';
import {NormalizedPackageJson} from 'read-pkg';

@Injectable()
export class AppVersionHeader implements NestMiddleware {
    private readonly package_json: NormalizedPackageJson;

    public constructor (
        @Inject('NormalizedPackageJson') package_info: NormalizedPackageJson,
    ) {
        this.package_json = package_info.package_json;
    }

    public use (_request: Request, response: Response, next: Function): void {
        const {name, version} = this.package_json;

        response.setHeader('X-App-Version', `${name} ${version}`);
        next();
    }
}
