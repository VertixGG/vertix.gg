module.exports = {
    // Match .editorconfig settings
    tabWidth: 4,
    useTabs: false,
    printWidth: 120,
    endOfLine: 'lf',
    singleQuote: false,
    trailingComma: 'none',
    semi: true,

    // Special overrides for different file types based on .editorconfig
    overrides: [
        {
            files: ['*.vue', '*.prisma', '*.less', '*.sass', '*.scss'],
            options: {
                tabWidth: 2
            }
        }
    ],

    // Ensure Prettier respects .editorconfig
    editorconfig: true
};
