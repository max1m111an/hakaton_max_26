import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    globalIgnores([ "dist", "src-tauri/**" ]),
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: [ "**/*.{ts,tsx}" ],
        plugins: {
            react,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                    destructuredArrayIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/no-explicit-any": "off",
            "semi": [ "error", "always" ],
            "comma-dangle": [ "error", "always-multiline" ],
            "indent": [ "error", 4 ],
            "quotes": [ "error", "double", { avoidEscape: true } ],
            "object-curly-spacing": [ "error", "always" ],
            "array-bracket-spacing": [ "error", "always" ],
            "comma-style": [ "error", "last" ],
            "semi-spacing": [ "error", { before: false, after: true } ],
            "space-infix-ops": "error",
            "space-before-blocks": "error",
            "arrow-spacing": "error",
            "arrow-parens": [ "error", "always" ],
            "prefer-const": "error",
            "no-trailing-spaces": "error",
            "no-multi-spaces": "error",
            "react/react-in-jsx-scope": "off",
            "react/jsx-indent": [ "error", 4 ],
            "react/jsx-tag-spacing": [
                "error",
                {
                    closingSlash: "never",
                    beforeSelfClosing: "always",
                    afterOpening: "never",
                    beforeClosing: "allow",
                },
            ],
            "react/jsx-curly-spacing": [ "error", { when: "always" } ],
            "no-multiple-empty-lines": [
                "error",
                { max: 2, maxEOF: 1, maxBOF: 0 },
            ],
        },
    },
]);