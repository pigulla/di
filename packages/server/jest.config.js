const jest_config = require('@digitally-imported/jest-config/no-coverage-threshold')

module.exports = Object.assign(jest_config, {
    coveragePathIgnorePatterns: [...jest_config.coveragePathIgnorePatterns,  "<rootDir>/src/module/"],
})
