const join = require('path').join

module.exports = {
    moduleFileExtensions: ['js', 'ts'],
    testRegex: '\\.spec\\.ts$',
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    setupFilesAfterEnv: [join(__dirname, 'setup.ts')],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.ts', '!src/**/index.ts'],
    coverageDirectory: '<rootDir>/coverage',
    coveragePathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/node_modules/', '<rootDir>/test/'],
    coverageThreshold: {
        global: {
            branches: 95,
            functions: 95,
            lines: 95,
            statements: -5
        }
    },
    testEnvironment: 'node',
    moduleNameMapper: {
        '^~src/?$': '<rootDir>/src/index.ts',
        '^~src/(.+)': '<rootDir>/src/$1',
        '^~test/?$': '<rootDir>/test/index.ts',
        '^~test/(.+)': '<rootDir>/test/$1'
    },
    preset: 'ts-jest',
    globals: {
        'ts-jest': {
            tsConfig: '<rootDir>/test/tsconfig.json'
        }
    }
}
