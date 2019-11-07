import {Injectable, NestMiddleware, Inject} from '@nestjs/common'
import {Request, Response} from 'express'
import {NormalizedPackageJson} from 'read-pkg'

@Injectable()
export class AppVersionHeader implements NestMiddleware {
    public static readonly HEADER_NAME = 'X-App-Version'
    private readonly package_json: NormalizedPackageJson

    public constructor (
        @Inject('NormalizedPackageJson') package_json: NormalizedPackageJson,
    ) {
        this.package_json = package_json
    }

    public use (_request: Request, response: Response, next: Function): void {
        const {name, version} = this.package_json

        response.setHeader(AppVersionHeader.HEADER_NAME, `${name} ${version}`)
        next()
    }
}
