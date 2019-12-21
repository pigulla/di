import {Injectable, NestMiddleware, Inject} from '@nestjs/common'
import {Request, Response} from 'express'
import {NormalizedPackageJson} from 'read-pkg'

@Injectable()
export class AppVersionHeader implements NestMiddleware {
    public static readonly HEADER_NAME = 'X-DI-Version'
    private readonly package_json: NormalizedPackageJson

    public constructor (
        @Inject('normalized_package_json') package_json: NormalizedPackageJson,
    ) {
        this.package_json = package_json
    }

    public use (_request: Request, response: Response, next: Function): void {
        const {version} = this.package_json

        response.setHeader(AppVersionHeader.HEADER_NAME, version)
        next()
    }
}
