const path = require('path');

module.exports = {
  entry: './src/example.js',
  output: {
    filename: 'example.js',
    path: path.resolve(__dirname, 'example')
	},
	devServer: {
		static: './example',
		compress: true,
		hot: false
  },
  module: {
    rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: ['babel-loader']
        }
    ]
  }
};
