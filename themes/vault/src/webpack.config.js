const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin')

const define = new webpack.DefinePlugin({
    'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    }
});

/* Plugins */
const cleanBuild = new CleanPlugin([
    '../static/css/*',
    '../static/js/*'
], {
    allowExternal: true,
    verbose: true
});

const extractCSS = new ExtractTextPlugin({
    filename: getPath =>
        getPath('css/[name].[hash].css').replace('css', '../css')
});

const assetsManifest = new AssetsPlugin({
    filename: 'assets.json',
    path: path.join(__dirname, '../data'),
    fullPath: false,
    processOutput: assets => {
        Object.keys(assets).forEach(bundle => {
            Object.keys(assets[bundle]).forEach(type => {
                let filename = assets[bundle][type]
                assets[bundle][type] = filename.slice(filename.indexOf(bundle))
            })
        })
        return JSON.stringify(assets, null, 2)
    }
});

/* Config */
const config = {
    entry: {
        main: path.join(__dirname, "js", "main.js")
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, '../static', 'js')
    },
    module: {
        rules: [{
            test: /\.less$/,
            include: path.resolve(__dirname, 'css'),
            loader: extractCSS.extract({
                use: [{
                    loader: 'css-loader',
                    options: {
                        importLoaders: 1
                    }
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        plugins: [
                            autoprefixer({
                                browsers: ['> 1%', 'last 2 versions']
                            })
                        ]
                    }
                },
                {
                    loader: 'less-loader'
                }]
            })
        }]
    },
    resolve: {
        extensions: ['*', '.js', '.less']
    },
    plugins: [
        define,
        cleanBuild,
        extractCSS,
        assetsManifest
    ]
}

module.exports = config;
