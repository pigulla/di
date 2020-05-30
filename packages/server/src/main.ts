import {start_server} from './start_server'

start_server(process.argv).catch(function (_error: Error) {
    // eslint-disable-next-line no-process-exit
    process.exit(2)
})
