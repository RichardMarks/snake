/* eslint-disable */
const camelize = name => {
  return name.replace(/-[a-z]/g, match => match[1].toUpperCase());
};

require('matchdep').filterDev(['gulp*']).forEach(module => {
  global[camelize(module.replace(/^gulp-/, ''))] = require(module);
});

import { task, src, dest, watch } from 'gulp-es-next';
import rimraf from 'rimraf';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import packageJson from './package.json';
import webpackConfig from './webpack.config';
import path from 'path';
import es from 'event-stream';

const log = util.log;
const env = process.env.NODE_ENV;
const PORT = process.env.PORT || 7777;
const BUILD_DIR = 'build';
const PUBLIC_HTML_DIR = 'public_html';
const DIST_DIR = 'dist';

function copyStatic(sourceDir, destDir) {
  return src(sourceDir).pipe(changed(destDir)).pipe(dest(destDir)).pipe(size({title: 'static'}));
}

function devServer() {
  const devServerInjection = `webpack-dev-server/client?http://localhost:${PORT}`;
  webpackConfig.entry.unshift(devServerInjection);
  const compiler = webpack(webpackConfig);
  const options = {
    contentBase: BUILD_DIR,
    watchOptions: {
      aggregateTimeout: 100
    }
  };
  const server = new WebpackDevServer(compiler, options);
  return server.listen(PORT, '0.0.0.0', err => {
    if (err) {
      throw new PluginError('webpack-dev-server', err);
    }
    log(`[${packageJson.name} serve]`, `Listening at http://localhost:${PORT}`);
  });
}

function buildStaticDeployablePackage(cb) {
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      throw new PluginError('dist', err);
    }
    log(`[${packageJson.name} dist]`, stats.toString({ colors: true }));
    cb();
  });
}

task('dist:clean', cb => rimraf(DIST_DIR, cb));
task('dist:static', () => copyStatic([`${PUBLIC_HTML_DIR}/**/*`], DIST_DIR));
task('dist:build', ['dist:static'], cb => buildStaticDeployablePackage(cb));
task('serve:static', () => copyStatic([`${PUBLIC_HTML_DIR}/**/*`], BUILD_DIR));
task('serve:watch', () => watch(`${PUBLIC_HTML_DIR}/**`, ['serve:static']));
task('serve:start', ['serve:static', 'serve:watch'], () => devServer());
task('clean', cb => rimraf(BUILD_DIR, cb));
task('dist', sequence('dist:clean', 'dist:build'));
task('default', sequence('clean', 'serve:start'));
