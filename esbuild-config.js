const esbuild = require('esbuild');
const path = require('path');
const copyStaticFiles = require('esbuild-copy-static-files');

const excludedExt = ['.js', '.g4', '.interp', '.tokens'];

esbuild
	.build({
		entryPoints: [
			path.resolve(__dirname, 'src/forward_engineering/api.js'),
			path.resolve(__dirname, 'src/reverse_engineering/api.js'),
		],
		bundle: true,
		platform: 'node',
		outdir: 'build',
		minify: true,
		sourcemap: false,
		plugins: [
			copyStaticFiles({
				src: 'src',
				dest: 'build',
				dereference: true,
				filter: (srcPath, destPath) => {
					return !excludedExt.some(extName => srcPath.endsWith(extName));
				},
				recursive: true,
			}),
		],
	})
	.then(args => console.log(args));
