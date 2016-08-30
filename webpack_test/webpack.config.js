var rucksack = require('rucksack-css');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');


var isPro = process.env.NODE_ENV === 'production';

var cssLoaderConf = 'modules&sourceMap&importLoaders=1&localIdentName=[local]___[hash:base64:5]';
var bundle_name = '[name]_bundle.js';
var chunk_name = '[name]_chunk.js';
var index_path = '/dist/index.html';

if(isPro){
  cssLoaderConf = 'modules&importLoaders=1&localIdentName=[local]___[hash:base64:5]';
  bundle_name = '[name]_bundle_[chunkhash].js';
  chunk_name = '[name]_chunk_[chunkhash].js';
}

var plugins = [
  new webpack.optimize.CommonsChunkPlugin("vendor", bundle_name),
  new webpack.DefinePlugin({
    'IS_PRO': isPro
  }),
  new HtmlWebpackPlugin({
    filename: path.join(__dirname, index_path),
    template: path.join(__dirname, '/src/index.ejs')
  })
]

if (isPro) {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({ //压缩
      compress: {
        warnings: false,
      },
      sourceMap: false,
      output: {
        comments: false,
      },
    }));
};


module.exports = {
  context: path.join(__dirname, './src'),
  entry: {
    app: "./index.js",
    vendor: [
      'jquery',
      'react',
      'react-dom',
      'react-redux',
      'react-router',
      'react-router-redux',
      'redux'
    ]
  },
  output: {
    path: './dist',
    filename: bundle_name,
    chunkFilename: chunk_name
  },
  module: {
    loaders: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      loaders: [
        'react-hot',
        'babel-loader'
      ]
    }, {
      test: /\.scss$/,
      loaders: ["style", "css?" + cssLoaderConf, "postcss", "sass"]
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  postcss: [
    rucksack({
      autoprefixer: true
    })
  ],
  plugins: plugins,
  devServer: {
    contentBase: './dist',
    hot: true
  }
};