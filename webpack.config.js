'use strict';
const path = require('path');
const webpack = require('webpack');
const debug = process.env.NODE_ENV !== 'production';
const outputPath = path.resolve(__dirname, debug ? 'build' : 'dist');
module.exports = {
  entry: [path.resolve(__dirname, 'src', 'index.js')],
  output: {
    path: outputPath,
    filename: '[name].js',
    publicPath: './',
  },
  plugins: debug ? [] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {screw_ie8: true, keep_fnames: true, warnings: false},
      mangle: {screw_ie8: true, keep_fnames: true},
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
  ],
  devtool: debug ? 'source-map' : undefined,
  module: {
    preLoaders: [
      {
        test: /(\.js)$/,
        loader: 'eslint-loader',
        exclude: [/(node_modules)/, /(build)/],
      },
    ],
    loaders: [
      {
        test: /(\.js)$/,
        include: [path.resolve('./src')],
        loader: 'babel',
      },
    ],
  },
  resolve: {
    root: [
      path.resolve('./src'),
    ],
    extensions: ['', '.js'],
  },
  eslint: {
    quiet: true,
    failOnWarning: false,
    failOnError: true,
  },
};
