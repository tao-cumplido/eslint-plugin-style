module.exports = {
    moduleFileExtensions: ['js', 'ts'],
    rootDir: 'src',
    testEnvironment: 'node',
    testRegex: /\.spec\.ts$/.source,
    transform: {
        [/^.+\.ts$/.source]: 'ts-jest',
    },
    globals: {
        'ts-jest': {
            packageJson: 'package.json',
        },
    },
};
