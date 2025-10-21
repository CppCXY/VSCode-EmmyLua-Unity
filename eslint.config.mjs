import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
	{
		ignores: [
			'out/**',
			'dist/**',
			'build/**',
			'node_modules/**',
			'**/*.d.ts',
			'**/*.js',
			'src/test/**'
		]
	},
	{
		files: ['src/**/*.ts'],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: 'module',
				project: './tsconfig.json'
			}
		},
		plugins: {
			'@typescript-eslint': tseslint
		},
		rules: {
			// TypeScript specific
			'@typescript-eslint/naming-convention': [
				'warn',
				{
					selector: 'default',
					format: ['camelCase'],
					leadingUnderscore: 'allow',
					trailingUnderscore: 'allow'
				},
				{
					selector: 'variable',
					format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
					leadingUnderscore: 'allow'
				},
				{
					selector: 'typeLike',
					format: ['PascalCase']
				},
				{
					selector: 'enumMember',
					format: ['PascalCase', 'UPPER_CASE']
				}
			],
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			
			// General JavaScript/TypeScript rules
			'no-throw-literal': 'error',
			'prefer-const': 'warn',
			'no-var': 'error',
			'eqeqeq': ['error', 'always'],
			'curly': ['warn', 'all']
		}
	}
];
