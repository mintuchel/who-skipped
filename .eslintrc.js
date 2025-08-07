module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module"
    },
    plugins: ["@typescript-eslint", "prettier"],
    extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended" // Prettier와 충돌 방지 자동 적용
    ],
    rules: {
        "@typescript-eslint/no-unused-vars": ["warn"],
        "@typescript-eslint/no-explicit-any": "off",
        "prettier/prettier": ["error"] // Prettier 포맷에 맞지 않으면 ESLint 에러로 표시
    }
};
