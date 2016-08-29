const webpack = require('webpack');

module.exports = {
  entry: {
    app: './src/app.js',
    vendor: ['jquery', 'react', 'react-redux', 'redux']
  },
  output: {
    path: './src',
    publicPath: '/bin/',
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js'
  },
  module: {
    loaders: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      loaders: [
        'react-hot',
        'babel-loader'
      ]
    }, 
    {
      test: /\.css$/,
      loaders: ["style", "css"]
    }, {
      test: /\.scss$/,
      loaders: ["style", "css", "sass"]
    }]
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'ENV': process.env.NODE_ENV || 'development'
    }),
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js')  
    /*    new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false,
          },
          output: {
            comments: false,
          },
        })*/
  ],
  devServer: {
    hot: true
  }
};