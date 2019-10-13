import fs from 'fs'
import {join} from 'path'

import {Scope} from 'nock'

export abstract class EndpointBuilder {
    protected base_url: string = 'https://di.fm'

    public for_base_url (base_url: string): this {
        this.base_url = base_url
        return this
    }

    protected load_response (name: string): string {
        const filename = join(__dirname, '..', '..', 'di-response', `${name}.html`)
        const buffer = fs.readFileSync(filename)

        return buffer.toString()
    }

    public abstract build (): Scope
}
