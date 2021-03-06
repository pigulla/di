# @digitally-imported/i3-blocklet
[![Typescript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/npm/v/@digitally-imported/i3-blocklet?style=flat-square)](https://www.npmjs.com/package/@digitally-imported/i3-blocklet)
[![GitHub license](https://img.shields.io/github/license/pigulla/di?style=flat-square)](https://github.com/pigulla/di/blob/master/LICENSE)
[![Travis CI](https://img.shields.io/travis/com/pigulla/di/master?style=flat-square)](https://travis-ci.com/pigulla/di)
[![Dependencies](https://img.shields.io/david/pigulla/di?path=packages/i3-blocklet&style=flat-square)](https://david-dm.org/pigulla/di?path=packages%2Fi3-blocklet)
[![DevDependencies](https://img.shields.io/david/dev/pigulla/di?path=packages/i3-blocklet&style=flat-square)](https://david-dm.org/dev/pigulla/di?path=packages%2Fi3-blocklet)
[![codecov](https://img.shields.io/codecov/c/github/pigulla/di?flag=i3blocklet&style=flat-square)](https://codecov.io/gh/pigulla/di/tree/master/packages/i3-blocklet/src)
[![Snyk](https://snyk.io/test/github/pigulla/di/badge.svg?targetFile=packages/i3-blocklet/package.json&style=flat-square)](https://snyk.io/test/github/pigulla/di?targetFile=packages%2Fi3-blocklet%2Fpackage.json&tab=dependencies)

### Setup
Add the following section to your `.i3blocks.conf` (adjust as needed):
```
[di]
instance=DI
interval=5
format=json
command=/path/to/i3-blocklet/bin/run
```

And then restart i3 for the changes to take effect:
```
i3-msg restart
```

### See also

 - https://i3wm.org/docs/i3bar-protocol.html#_blocks_in_detail
 - https://github.com/vivien/i3blocks
