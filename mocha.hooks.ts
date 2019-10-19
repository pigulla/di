import {join} from 'path'
import {Polly, setupMocha as setupPolly} from '@pollyjs/core'
import NodeHttpAdapter from '@pollyjs/adapter-node-http'
import FSPersister from '@pollyjs/persister-fs'

Polly.register(NodeHttpAdapter)
Polly.register(FSPersister)

const recordings_directory = join(__dirname, 'recordings')

setupPolly({
    mode: 'record',
    adapters: ['node-http'],
    persister: 'fs',
    persisterOptions: {
        fs: {
            recordingsDir: recordings_directory,
        },
    },
})
