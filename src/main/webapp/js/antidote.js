// Notes on Bundling:
// This module imports all the dependencies used by the Antidote web application. After running the
// bundler this results in a monolithic file containing the JS dependencies needed for all pages of
// the app.
//
// Keeping this monolithic was done for simplicities sake.
// Individual bundles could be made for each page, but that is a unnecessary optimization given the
// rather small size of the monolithic bundle.

// import antidote resources bundles (text & styles) and set them in their global locations rather
// than configuring per-component or using component defaults
import l8n from 'antidote-localization' // this module is aliased to the desired localization in rollup.config.js
window.antidoteLocalization = l8n;
window.antidoteStyleSheet = '/node_modules/nre-styles/dist/styles.css';

// required for correct lab page height on iOS
import 'antidote-ui-components/helpers/visual-viewport-height';

// import all components exported by antidote-ui-components
import 'antidote-ui-components';
