# @digitally-imported/cli
[![Typescript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/npm/v/@digitally-imported/cli?style=flat-square)](https://www.npmjs.com/package/@digitally-imported/cli)
[![GitHub license](https://img.shields.io/github/license/pigulla/di?style=flat-square)](https://github.com/pigulla/di/blob/master/LICENSE)
[![Travis CI](https://img.shields.io/travis/com/pigulla/di/master?style=flat-square)](https://travis-ci.com/pigulla/di)
[![Dependencies](https://img.shields.io/david/pigulla/di?style=flat-square&path=packages/cli)](https://david-dm.org/pigulla/di?path=packages%2Fcli)
[![DevDependencies](https://img.shields.io/david/dev/pigulla/di?style=flat-square&path=packages/cli)](https://david-dm.org/dev/pigulla/di?path=packages%2Fcli)
[![codecov](https://codecov.io/gh/pigulla/di/branch/master/graph/badge.svg?flag=cli)](https://codecov.io/gh/pigulla/di/tree/master/packages/cli/src)
[![Snyk](https://snyk.io/test/github/pigulla/di/badge.svg?targetFile=packages/cli/package.json&style=flat-square)](https://snyk.io/test/github/pigulla/di?targetFile=packages%2Fserver%2Fpackage.json&tab=dependencies)

# Usage
<!-- usage -->
```sh-session
$ npm install -g @digitally-imported/cli
$ di COMMAND
running command...
$ di (-v|--version|version)
@digitally-imported/cli/0.0.3 linux-x64 node-v13.5.0
$ di --help [COMMAND]
USAGE
  $ di COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`di channels`](#di-channels)
* [`di get-volume`](#di-get-volume)
* [`di help [COMMAND]`](#di-help-command)
* [`di ping`](#di-ping)
* [`di play CHANNEL`](#di-play-channel)
* [`di select`](#di-select)
* [`di set-volume VOLUME`](#di-set-volume-volume)
* [`di status`](#di-status)
* [`di stop`](#di-stop)

## `di channels`

List all available channels.

```
USAGE
  $ di channels

OPTIONS
  -e, --endpoint=endpoint          [default: http://localhost:4979] The endpoint where the server is listening
  -f, --favorites-only             List favorite channels only
  -o, --output-format=(text|json)  [default: text] The output format
  -s, --skip-version-check         Do not check whether the client and server versions match

EXAMPLE
  $ di channels
```

## `di get-volume`

Get the current playback volume.

```
USAGE
  $ di get-volume

OPTIONS
  -e, --endpoint=endpoint          [default: http://localhost:4979] The endpoint where the server is listening
  -o, --output-format=(text|json)  [default: text] The output format
  -s, --skip-version-check         Do not check whether the client and server versions match

EXAMPLE
  $ di get-volume
```

## `di help [COMMAND]`

display help for di

```
USAGE
  $ di help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `di ping`

Test if the server is alive.

```
USAGE
  $ di ping

OPTIONS
  -e, --endpoint=endpoint          [default: http://localhost:4979] The endpoint where the server is listening
  -o, --output-format=(text|json)  [default: text] The output format
  -s, --skip-version-check         Do not check whether the client and server versions match

EXAMPLE
  $ di ping
```

## `di play CHANNEL`

Play a channel.

```
USAGE
  $ di play CHANNEL

ARGUMENTS
  CHANNEL  The name of the channel to play.

OPTIONS
  -e, --endpoint=endpoint          [default: http://localhost:4979] The endpoint where the server is listening
  -o, --output-format=(text|json)  [default: text] The output format
  -s, --skip-version-check         Do not check whether the client and server versions match

EXAMPLE
  $ di play progressive
```

## `di select`

List all available channels.

```
USAGE
  $ di select

OPTIONS
  -e, --endpoint=endpoint          [default: http://localhost:4979] The endpoint where the server is listening
  -f, --favorites-only             List favorite channels only
  -o, --output-format=(text|json)  [default: text] The output format
  -s, --skip-version-check         Do not check whether the client and server versions match

EXAMPLE
  $ di channels
```

## `di set-volume VOLUME`

Set the playback volume.

```
USAGE
  $ di set-volume VOLUME

ARGUMENTS
  VOLUME  The new volume (between 0 and 125).

OPTIONS
  -e, --endpoint=endpoint          [default: http://localhost:4979] The endpoint where the server is listening
  -o, --output-format=(text|json)  [default: text] The output format
  -s, --skip-version-check         Do not check whether the client and server versions match

EXAMPLE
  $ di set-volume 80
```

## `di status`

Show the current playback status.

```
USAGE
  $ di status

OPTIONS
  -e, --endpoint=endpoint          [default: http://localhost:4979] The endpoint where the server is listening
  -o, --output-format=(text|json)  [default: text] The output format
  -s, --skip-version-check         Do not check whether the client and server versions match

EXAMPLE
  $ di status
```

## `di stop`

Stop playback.

```
USAGE
  $ di stop

OPTIONS
  -e, --endpoint=endpoint          [default: http://localhost:4979] The endpoint where the server is listening
  -o, --output-format=(text|json)  [default: text] The output format
  -s, --skip-version-check         Do not check whether the client and server versions match

EXAMPLE
  $ di stop
```
<!-- commandsstop -->
