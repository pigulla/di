import {JsonValue} from 'type-fest'

export const EXIT_CODE_URGENT = 33

export enum Schedule {
    NEVER = 0,
    ON_STARTUP = -1,
    REPEAT = -2,
    PERSIST = -3,
}

type Color = string
type Pixel = number

// https://i3wm.org/docs/i3bar-protocol.html#_blocks_in_detail
// https://github.com/vivien/i3blocks
export interface Blocklet {
    full_text: string
    short_text?: string
    command?: string
    interval?: number
    signal?: number
    format?: 'json'
    background?: Color
    color?: Color
    border?: Color
    border_top?: Pixel
    border_right?: Pixel
    border_bottom?: Pixel
    border_left?: Pixel
    min_width?: Pixel
    markup?: 'pango'|'none'
    align?: 'center'|'right'|'left'
    name?: string
    instance?: string
    urgent?: boolean
    separator?: boolean
    separator_block_width?: Pixel
    [custom: string]: JsonValue|undefined
}
