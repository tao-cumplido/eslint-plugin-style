module.exports = {
	'*.{json,md}': ['prettier --write', 'git add'],
	'*.{js,ts}': 'eslint',
	'.eslintrc.js': 'yarn run lint',
};
