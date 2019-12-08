module.exports = {
    "extends": "@istanbuljs/nyc-config-typescript",
    "reporter": [
        "html",
        "text",
        "lcov"
    ],
    "all": true,
    "extension": [
        ".ts"
    ],
    "require": [
        "ts-node/register",
        "source-map-support/register"
    ],
    "cache": false
}
