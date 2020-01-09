// Notes on Bundling:
// This module imports all the dependencies used by the Antidote web application. After running the
// bundler this results in a monolithic file containing all JS dependencies needed for the app.
//
// Keeping this monolithic was done for simplicities sake.
// Individual bundles could be made for each page, but that is a unnecessary optimization given the
// rather small size of the monolithic bundle.

// required for correct lab page height on iOS
import 'antidote-ui-components/helpers/visual-viewport-height';

// import all components exported by antidote-ui-components
import 'antidote-ui-components';
