{
    "extends": [
        "eslint-config-standard",
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "plugins": [
        "@typescript-eslint/eslint-plugin"
    ],
    "rules": {
        "no-unused-vars": "off",
        "comma-dangle": [
            "error",
            "always-multiline"
        ],
        "object-curly-spacing": [
            "error",
            "never"
        ],
        "indent": [
            "error",
            4,
            {
                "SwitchCase": 1
            }
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
            "files": ["packages/*/test/**/*"],
            "env": {
                "mocha": true
            }
        },
        {
            "files": ["packages/*/test/**/*.spec.ts"],
            "rules": {
                "no-unused-expressions": "off"
            }
        }
    ]
}
