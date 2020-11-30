module.exports = {
	'*.{js,ts,json,md}': ['prettier --write', 'git add'],
	'*.{js,ts}': 'eslint',
	'.eslintrc.js': 'yarn run lint',
	'.prettierrc.js': 'prettier --check "**/*.{js,ts,json,md}"',
};
