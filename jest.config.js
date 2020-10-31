module.exports = {
	moduleFileExtensions: ['js', 'ts'],
	rootDir: 'src',
	testEnvironment: 'node',
	testRegex: /\.spec\.ts$/u.source,
	transform: {
		[/^.+\.ts$/u.source]: 'ts-jest',
	},
};
