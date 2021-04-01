const commonjs = require('@rollup/plugin-commonjs');
const livereload = require('rollup-plugin-livereload');
const svelte = require('rollup-plugin-svelte');
const resolve = require('@rollup/plugin-node-resolve');

const defaultBrowserslist = [ 'last 2 versions' ];

module.exports = {
    input: __dirname + '/src/Demo.svelte',
    output: {
        sourcemap: true,
        format: 'iife',
        name: 'Demo',
        file: __dirname + '/public/bundle.js',
    },
    plugins: [
        svelte({
            emitCss: false,
        }),
        livereload(),
        resolve({
            browser: true,
        }),
        commonjs(),
    ],
};
