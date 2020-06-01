export type Options = {
    host: string
    port: number
    interval: number
    timeout: number
}

export interface IWaitForHttpPort {
    (options: Options): Promise<boolean>
}
