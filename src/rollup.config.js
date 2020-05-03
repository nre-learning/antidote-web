import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import antidoteConfig from './antidote-config';

// if this is not a "watched" build, assume it's a prod build
const production = !process.env.ROLLUP_WATCH;

function getLocalizationModulePath() {
    let l8nPath;

    if (antidoteConfig['localization-module']) {
        l8nPath = `${antidoteConfig['localization-module']}/index.js`;
    } else if (antidoteConfig['locale']) {
        l8nPath = `antidote-localizations/bundles/${antidoteConfig['locale']}.js`;
    } else {
      throw new Error('No "locale" or "localization-module" provided in antidote-config.js');
    }

    return path.resolve(__dirname, `node_modules/${l8nPath}`);
}

export default {
    input: 'js/antidote.js',
    output: {
        file: 'js/bundles/antidote.js',
        format: 'esm',
        sourcemap: true
    },
    plugins: [

        alias({
            entries: [
                // provide configured localization module to antidote.js
                { find: 'antidote-localization', replacement: getLocalizationModulePath() },
                // use to sub-in un-minified resources during debugging (when those modules are shipped minified by default)
                // { find: 'xterm-addon-fit', replacement: path.resolve(__dirname, 'node_modules/xterm-addon-fit/out/FitAddon.js') },
            ]
        }),
        resolve(),
        commonjs({
            namedExports: {
                // needed for xterm compatibility w/ rollup
                'xterm': [ 'Terminal' ]

                // If you're using  a local path for the antidote-ui-components path, you will need to use this
                // instead of the above.
                // '../../antidote-ui-components/node_modules/xterm/lib/xterm.js': [ 'Terminal' ]
            },
        }),
        production && terser() // minify, but only in production
    ]
};
