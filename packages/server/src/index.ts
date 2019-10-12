import {AddressInfo, Server} from 'net'

import {NormalizedPackageJson} from 'read-pkg'
import {NestFactory} from '@nestjs/core'
import {ValidationPipe} from '@nestjs/common'

import {AppModule} from './app.module'
import {Logger} from './service'
import {yargs, CliOptions} from './service/yargs'

async function bootstrap (): Promise<void> {
    const {logLevel, hostname, port} = yargs.argv as any as CliOptions
    const root_logger = new Logger(logLevel)
    const app = await NestFactory.create(AppModule, {logger: root_logger})

    app.useLogger(root_logger)
    app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true}))
    app.use(root_logger.get_request_logger())
    app.enableShutdownHooks()

    const server = app.getHttpServer() as Server
    server.once('listening', function () {
        const {name, version} = app.get<NormalizedPackageJson>('NormalizedPackageJson')
        const address = server.address() as AddressInfo

        root_logger.log(`Application ${name} v${version} listening on ${address.address}:${address.port}`)
    })

    await app.listen(port, hostname)
}

bootstrap()
