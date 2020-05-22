module.exports = {
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint/eslint-plugin",
        "import"
    ],
    "settings": {
        "import/parsers": {
            "@typescript-eslint/parser": [
                ".ts",
                ".tsx"
            ]
        },
        "import/internal-regex": "^@digitally-imported/"
    },
    "extends": [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/errors",
        "plugin:import/typescript",
        "prettier",
        "prettier/@typescript-eslint"
    ],
    "env": {
        "node": true
    },
    "rules": {
        "comma-dangle": [
            "error",
            "always-multiline"
        ],
        "max-len": [
            "error",
            {
                "code": 100,
                "ignoreTemplateLiterals": true
            }
        ],
        "no-console": "error",
        "no-unused-vars": "off",
        "object-curly-spacing": [
            "error",
            "never"
        ],
        "semi": [
            "error",
            "never"
        ],
        "camelcase": "off",
        "lines-between-class-members": [
            "error",
            "always",
            {
                "exceptAfterSingleLine": true
            }
        ],
        "no-process-env": "error",
        "no-process-exit": "error",
        "import/default": "off",
        "import/order": ["error", {
            "newlines-between": "always",
            "alphabetize": {
                "order": "asc",
                "caseInsensitive": true
            },
            "groups": [
                "builtin",
                "external",
                "internal",
                "parent",
                "sibling",
                "index",
                "unknown"
            ],
            "pathGroups": [
                {
                    "pattern": "~src/**",
                    "group": "internal",
                    "position": "after"
                },
                {
                    "pattern": "~test/**",
                    "group": "parent",
                    "position": "before"
                }
            ]
        }],
        "@typescript-eslint/explicit-member-accessibility": "error",
        "@typescript-eslint/ban-ts-comment": ["error", {
            "ts-ignore": false,
        }],
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-parameter-properties": [
            "error",
            {
                "allows": [
                    "public readonly"
                ]
            }
        ],
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-object-literal-type-assertion": "off",
        "@typescript-eslint/array-type": [
            "error",
            {
                "default": "array-simple",
                "readonly": "array-simple"
            }
        ],
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/explicit-function-return-type": [
            "error",
            {
                "allowExpressions": true
            }
        ],
        "@typescript-eslint/member-delimiter-style": [
            "error",
            {
                "multiline": {
                    "delimiter": "none",
                    "requireLast": false
                },
            }
        ],
        "@typescript-eslint/naming-convention": [
            "warn",
            {
                "selector": "default",
                "format": [
                    "snake_case"
                ],
                "leadingUnderscore": "forbid",
                "trailingUnderscore": "forbid"
            },
            {
                "selector": "typeLike",
                "format": [
                    "PascalCase"
                ],
                "leadingUnderscore": "forbid",
                "trailingUnderscore": "forbid"
            },
            {
                "selector": "property",
                "format": null,
                "leadingUnderscore": "forbid",
                "trailingUnderscore": "forbid"
            },
            {
                "selector": "parameter",
                "format": ["snake_case"],
                "leadingUnderscore": "allow",
                "trailingUnderscore": "forbid"
            },
            {
                "selector": "variable",
                "format": ["snake_case", "UPPER_CASE"],
                "leadingUnderscore": "forbid",
                "trailingUnderscore": "forbid"
            },
            {
                "selector": "method",
                "format": null,
                "leadingUnderscore": "forbid",
                "trailingUnderscore": "forbid",
                "filter": {
                    "regex": "^(onModuleInit|onModuleDestroy|onApplicationBootstrap|onApplicationShutdown|useFactory)$",
                    "match": true
                }
            },
            {
                "selector": "method",
                "format": ["snake_case"],
                "leadingUnderscore": "forbid",
                "trailingUnderscore": "forbid",
                "filter": {
                    "regex": "^(onModuleInit|useFactory)$",
                    "match": false
                }
            },
            {
                "selector": "enumMember",
                "format": [
                    "UPPER_CASE"
                ],
                "leadingUnderscore": "forbid",
                "trailingUnderscore": "forbid"
            }
        ]
    },
    "overrides": [
        {
            "files": ["test/**/*"],
            "rules": {
                "no-unused-expressions": "off"
            },
            "env": {
                "jest": true
            },
            "settings": {
                "import/resolver": {
                    "typescript": {
                        "directory": "test/tsconfig.json"
                    }
                }
            }
        }
    ]
};
