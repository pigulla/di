import {ChannelBuilder} from './Channel.builder'
import {ChannelFilterBuilder} from './ChannelFilter.builder'

/* eslint-disable max-len */

const classictechno = new ChannelBuilder()
    .with_director('Johan N. Lecander')
    .with_description('Go back in time and hear the biggest and best tracks within techno and trance that defined a decade of dance culture.')
    .with_id(14)
    .with_key('classictechno')
    .with_name('Oldschool Techno & Trance ')
    .with_images({
        default: 'https://cdn-images.audioaddict.com/2/4/9/d/1/8/249d182058ac9e5631557eb309efe80f.png',
        compact: 'https://cdn-images.audioaddict.com/b/b/7/7/a/e/bb77aeafbca185bd594ab579d080e107.jpg',
        banner: null,
    })
    .with_created_at('2010-03-16T22:02:42.000Z')
    .with_updated_at('2019-02-12T17:53:53.000Z')
    .build()

const progressive = new ChannelBuilder()
    .with_director('Johan N. Lecander')
    .with_description('Always moving forward, progressive continues to reinvent itself into new sounds and styles made for the floor.')
    .with_id(7)
    .with_key('progressive')
    .with_name('Progressive')
    .with_images({
        default: 'https://cdn-images.audioaddict.com/3/3/5/5/3/1/3355314492d633a5330c659cfe98fc1b.png',
        compact: 'https://cdn-images.audioaddict.com/3/f/c/e/3/7/3fce37012f1339a3db0a6dea553ad89a.jpg',
        banner: 'https://cdn-images.audioaddict.com/3/1/e/8/f/2/31e8f2aa779c711cd776c79a6cdd2617.png',
    })
    .with_created_at('2010-03-16T22:02:42.000Z')
    .with_updated_at('2019-02-12T17:53:24.000Z')
    .build()

const vocaltrance = new ChannelBuilder()
    .with_director('db')
    .with_description('Lush vocals paired together with emotive dance music. Beautiful melodies and endless energy.')
    .with_id(2)
    .with_key('vocaltrance')
    .with_name('Vocal Trance')
    .with_images({
        default: 'https://cdn-images.audioaddict.com/3/0/9/f/2/4/309f243a8a181ad83e8c5e15cd4b24c3.png',
        compact: 'https://cdn-images.audioaddict.com/b/3/9/6/8/9/b39689739a2f40b451dff594e432729d.jpg',
        banner: 'https://cdn-images.audioaddict.com/2/3/b/b/2/1/23bb217dfa36f127c017444d08ba33e7.png',
    })
    .with_created_at('2010-03-16T22:02:42.000Z')
    .with_updated_at('2019-02-12T18:04:07.000Z')
    .build()

const ambient = new ChannelFilterBuilder()
    .with_name('Ambient')
    .with_key('ambient')
    .with_id(15)
    .with_meta(false)
    .with_channels([12, 64, 285, 67, 280, 350, 292, 68, 3])
    .build()

const bass = new ChannelFilterBuilder()
    .with_name('Bass')
    .with_key('bass')
    .with_id(65)
    .with_meta(false)
    .with_channels([13, 105, 424, 293, 275, 230, 91, 177, 474, 15, 291, 184, 403, 181, 352, 348, 325, 198, 210, 289, 290, 292])
    .build()

const deep = new ChannelFilterBuilder()
    .with_name('Deep')
    .with_key('deep')
    .with_id(88)
    .with_meta(false)
    .with_channels([174, 182, 137, 348, 355])
    .build()

export const prebuilt_channel = {classictechno, progressive, vocaltrance}
export const prebuilt_channel_filter = {ambient, bass, deep}
