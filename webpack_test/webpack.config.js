const webpack = require('webpack');
module.exports = {
  entry: {
    vendor: 'jquery',
    app: './src/app.js'
  },
  output: {
    path: './bin',
    filename: '[name].bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
    },
    { test: /\.css$/, loaders: ["style", "css"] },
    { test: /\.scss$/, loaders: ["style", "css", "sass"] }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      output: {
        comments: false,
      },
    })
  ]
};