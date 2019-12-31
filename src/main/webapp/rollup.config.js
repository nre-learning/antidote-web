import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
    input: 'js/antidote.js',
    output: {
        file: 'js/bundles/antidote.js',
        format: 'esm',
        sourcemap: true
    },
    plugins: [
        // use to sub-in un-minified resources during debugging (some modules have been minified by default)
        // alias({
        //     entries: [
        //         { find: 'xterm-addon-fit', replacement: path.resolve(__dirname, 'node_modules/xterm-addon-fit/out/FitAddon.js') },
        //     ]
        // }),
        resolve(), // tells Rollup how to find date-fns in node_modules
        commonjs({
            namedExports: {
                'xterm': [ 'Terminal' ]
            },
        }), // converts date-fns to ES modules
        production && terser() // minify, but only in production
    ]
};
