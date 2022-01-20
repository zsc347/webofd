module.exports = {
    root: true,
    env: {
        browser: true,
        es6: true
    },
    extends: ["plugin:react/recommended", "plugin:react-hooks/recommended"],
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly"
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 2018,
        sourceType: "module"
    },
    plugins: ["react", "@typescript-eslint"],
    settings: {
        react: {
            pragma: "React",
            version: "detect"
        }
    },
    rules: {
        quotes: 0,
        semi: 0,
        "react/display-name": "off",
        "react/prop-types": "off",
        "react/react-in-jsx-scope": "off",
        "linebreak-style": 0,
        "no-var": "warn",
        "no-unused-vars": [
            "warn",
            {
                vars: "all",
                args: "after-used",
                ignoreRestSiblings: false,
                argsIgnorePattern: "^_"
            }
        ]
    },
    // see https://github.com/typescript-eslint/typescript-eslint/issues/46#issuecomment-470486034
    overrides: [
        {
            files: ["*.ts", "*.tsx"],
            rules: {
                "@typescript-eslint/no-unused-vars": [1, { args: "none" }]
            }
        }
    ]
};
