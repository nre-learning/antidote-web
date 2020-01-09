import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

// if this is not a "watched" build, assume it's a prod build
const production = !process.env.ROLLUP_WATCH;

export default {
    input: 'js/antidote.js',
    output: {
        file: 'js/bundles/antidote.js',
        format: 'esm',
        sourcemap: true
    },
    plugins: [
        // use to sub-in un-minified resources during debugging (for those modules that are shipped minified by default)
        // alias({
        //     entries: [
        //         { find: 'xterm-addon-fit', replacement: path.resolve(__dirname, 'node_modules/xterm-addon-fit/out/FitAddon.js') },
        //     ]
        // }),
        resolve(),
        commonjs({
            namedExports: {
                // needed for xterm compatibility w/ rollup
                'xterm': [ 'Terminal' ]
            },
        }),
        production && terser() // minify, but only in production
    ]
};
