const esbuild = require('esbuild');
const path = require('path');
const fsExtra = require('fs-extra');
const fs = require('fs/promises');

const buildFolderPath = path.resolve(__dirname, 'build');

const excludedExt = ['.js', '.g4', '.interp', '.tokens'];
const excludeFiles = [
	'.github',
	'.DS_Store',
	'.editorconfig',
	'.eslintignore',
	'.eslintrc',
	'.git',
	'.gitignore',
	'.husky',
	'.idea',
	'.prettierignore',
	'.prettierrc',
	'build',
	'node_modules',
	'package-lock.json',
];

const copyPluginFiles = filePaths => {
	return filePaths.reduce(async (nextFile, file) => {
		await nextFile;

		const ignoredFile = excludedExt.some(ext => file.endsWith(ext)) || excludeFiles.includes(file);
		if (ignoredFile) {
			return Promise.resolve();
		}

		const fileStats = await fs.lstat(file);
		if (fileStats.isDirectory()) {
			const nestedFiles = await fs.readdir(file);
			return copyPluginFiles(nestedFiles.map(nestedFile => path.join(file, nestedFile)));
		}

		return fsExtra.copy(file, path.resolve(buildFolderPath, file));
	}, Promise.resolve());
};

const copyFiles = {
	name: 'copyFiles',
	setup(build) {
		build.onEnd(async () => {
			const files = await fs.readdir(__dirname);
			await copyPluginFiles(files);
		});
	},
};

esbuild
	.build({
		entryPoints: [
			path.resolve(__dirname, 'forward_engineering/api.js'),
			path.resolve(__dirname, 'reverse_engineering/api.js'),
		],
		bundle: true,
		platform: 'node',
		outdir: buildFolderPath,
		minify: true,
		sourcemap: false,
		logLevel: 'info',
		plugins: [copyFiles],
	})
	.catch(() => process.exit(1));
