const webpack = require('webpack')
const path = require('path')
const autoprefixer = require('autoprefixer')
const Assets = require('assets-webpack-plugin')
const Clean = require('clean-webpack-plugin')
const ExtractText = require('extract-text-webpack-plugin')

const define = new webpack.DefinePlugin({
    'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    }
})

const cleanBuild = new Clean([
    'static/css/*',
    'static/js/*'
])

const extractCSS = new ExtractText({
    filename: getPath =>
        getPath('css/[name].[contenthash].css').replace('css', '../css')
})

const assetsManifest = new Assets({
    filename: 'assets.json',
    path: path.join(__dirname, 'data'),
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
})

const config = {
    entry: {
        main: path.join(__dirname, "src/scripts", "main.js")
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'static', 'js')
    },
    module: {
        rules: [{
            test: /\.less$/,
            include: path.resolve(__dirname, 'src/less'),
            loader: extractCSS.extract({
                use: [{
                    loader: 'css-loader',
                    options: {
                        importLoaders: 1,
                        sourceMap: true
                    }
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        plugins: [
                            autoprefixer({
                                browsers: ['> 1%', 'last 2 versions']
                            })
                        ],
                        sourceMap: true
                    }
                },
                {
                    loader: 'less-loader',
                    options: {
                        sourceMap: true
                    }
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
