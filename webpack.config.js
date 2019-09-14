const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackManifestPlugin = require('webpack-yam-plugin');
const _ = require('lodash');
const TerserPlugin = require('terser-webpack-plugin');
const packageJSON = require('./package');
const path = require('path');

const PROD = process.env.NODE_ENV === 'production';

console.log(PROD ? 'PRODUCTION BUILD' : 'DEVELOPMENT BUILD');

function keyMirror(obj) {
  return Object.keys(obj).reduce(function (memo, key) {
    memo[key] = key;
    return memo;
  }, {});
}

module.exports = {
  mode: PROD ? 'production' : 'development',
  context: __dirname,
  entry: {
    admin: ['./bundles/init', './bundles/admin'],
    donate: ['./bundles/init', './bundles/donate'],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true, // Must be set to true if using source-maps in production
      }),
    ],
  },
  output: {
    'filename': PROD ? 'tracker-[name]-[hash].js' : 'tracker-[name].js',
    'pathinfo': true,
    'path': __dirname + '/static/gen',
    'publicPath': '/static/gen',
  },
  plugins: _.compact([
    new WebpackManifestPlugin({
      manifestPath: __dirname + '/ui-tracker.manifest.json',
      outputRoot: __dirname + '/static'
    }),
    new MiniCssExtractPlugin({
      filename: PROD ? 'tracker-[name]-[hash].css' : 'tracker-[name].css',
      chunkFilename: '[id].css',
    }),
    new webpack.DefinePlugin({
      __DEVTOOLS__: !PROD,
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
    PROD && new TerserPlugin({
      extractComments: {
        condition: /@preserve|@license|@cc_on/i,
        filename: (file) => {
          return `${file}.LICENSE`;
        },
        banner: (licenseFile) => {
          return `License information can be found in ${licenseFile}`;
        },
      },
    }),
  ]),
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loaders: _.compact([
          !PROD && 'react-hot-loader/webpack',
          'babel-loader',
        ]),
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: !PROD,
            },
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]--[hash:base64:10]',
              },
            },
          }
        ],
      },
      {
        test: /\.(png|jpg|svg)$/,
        loaders: [
          'url-loader',
        ],
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loaders: [
          'file-loader',
        ],
      }
    ],
  },
  node: {
    fs: 'empty'
  },
  resolve: {
    alias: {
      ui: path.resolve('bundles'),
    },
  },
  stats: 'minimal',
  devServer: {
    proxy: [{
      context: [
        '/admin',
        '/logout',
        '/api',
        '/ui',
        '/static',
        '/tracker',
        '/donate',
      ],
      target: 'http://localhost:8000/',
      headers: {'X-Webpack': 1},
    }],
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.ngrok.io',
    ],
  },
  devtool: PROD ? 'source-map' : 'eval-source-map',
};
