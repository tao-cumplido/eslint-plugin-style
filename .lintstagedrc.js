module.exports = {
    '*.{json,js,ts,md}': ['prettier --write', 'git add'],
    '*.{js,ts}': 'eslint',
    '.eslintrc.js': 'npm run lint',
};
