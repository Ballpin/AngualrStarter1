const path = require('path');
const merge = require('webpack-merge');
const validate = require('webpack-validator');

const parts = require('./libs/parts');

const PATHS = {
    app: path.join(__dirname, 'app'),
    build: path.join(__dirname, 'build'),
    style: path.join(__dirname, 'app/assets/SCSS/', 'main.scss')
};
const TARGET = process.env.npm_lifecycle_event;
const ENABLE_POLLING = process.env.ENABLE_POLLING;
process.env.BABEL_ENV = TARGET;

const common = merge(
    {
        context: __dirname,
        // Entry accepts a path or an object of entries.
        // We'll be using the latter form given it's
        // convenient with more complex configurations.
        entry: {
            app: PATHS.app + '/entry.js'
        },
        output: {
            path: PATHS.build + '/',
            filename: '[name].js',
            //publicPath: 'http://localhost:8080',

            // Modify the name of the generated sourcemap file.
            // You can use [file], [id], and [hash] replacements here.
            // The default option is enough for most use cases.
            sourceMapFilename: '[file].map', // Default

            // This is the sourcemap filename template. It's default format
            // depends on the devtool option used. You don't need to modify this
            // often.
            devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]'
        }
    }
);
var config;

switch (process.env.npm_lifecycle_event) {
    case 'build':
        config = merge(
            common,
            {
                devtool: 'source-map'
            },
            parts.setupSCSS(PATHS.style),
            parts.setFreeVariable(
                'process.env.NODE_ENV',
                'production'
            ),
            parts.extractBundle({
                name: 'vendor',
                entries: ['react', 'react-dom']
            }),
            parts.minify()
            //parts.extractSCSS(PATHS.style)
        );
        break;
    default:
        config = merge(
            common,
            {
                devtool: 'eval-source-map',
                entry: {
                    style: PATHS.style
                }
            },
            parts.setupIndexHTML(PATHS.app + '/index.html'),
            parts.setupSCSS(PATHS.style),
            parts.copyWebpackPlugin(PATHS.app, PATHS.build),
            parts.rawLoader(),
            parts.devServer({
                // Customize host/port here if needed
                host: process.env.HOST,
                port: process.env.PORT
            }),
            parts.npmInstall()
        );
}

module.exports = validate(config);