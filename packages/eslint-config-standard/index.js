module.exports = {
    "extends": [
        "standard",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/typescript"
    ],
    "parser": "@typescript-eslint/parser",
    "plugins": [
        "@typescript-eslint/eslint-plugin"
    ],
    "rules": {
        "comma-dangle": [
            "error",
            "always-multiline"
        ],
        "indent": [
            "error",
            4,
            {
                "SwitchCase": 1
            }
        ],
        "max-len": ["error", 120],
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
        "no-dupe-class-members": "off",
        "no-process-env": "error",
        "no-process-exit": "error",
        "@typescript-eslint/explicit-member-accessibility": "error",
        "@typescript-eslint/ban-ts-ignore": "off",
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
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                "args": "none"
            }
        ],
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
                "singleline": {
                    "delimiter": "comma",
                    "requireLast": false
                }
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
                "mocha": true
            }
        }
    ]
}
