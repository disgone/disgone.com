/*jshint esversion: 6 */
const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');

const define = new webpack.DefinePlugin({
    'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    }
});

/* Plugins */
const cleanBuild = new CleanWebpackPlugin({
    verbose: true,
    cleanOnceBeforeBuildPatterns: [
        '**/*.css',
        '**/*.js'
    ]
});

const extractCSS = new MiniCssExtractPlugin({
    filename: '[name].[contenthash].css',
    chunkFilename: '[id].css'
});

const assetsManifest = new AssetsPlugin({
    filename: 'assets.json',
    path: path.join(__dirname, '../data'),
    fullPath: false,
    processOutput: assets => {
        Object.keys(assets).forEach(bundle => {
            Object.keys(assets[bundle]).forEach(type => {
                let filename = assets[bundle][type];
                assets[bundle][type] = filename.slice(filename.indexOf(bundle));
            });
        });
        return JSON.stringify(assets, null, 2);
    }
});

/* Config */
const config = {
    entry: {
        main: path.join(__dirname, "js", "main.js")
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, '../static')
    },
    module: {
        rules: [{
            test: /\.less$/,
            use: [
                {
                    loader: MiniCssExtractPlugin.loader
                },
                'css-loader',
                {
                    loader: "postcss-loader",
                    options: {
                        plugins: [
                            autoprefixer({})
                        ]
                    }
                },
                'less-loader'
            ]
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
};

module.exports = config;
