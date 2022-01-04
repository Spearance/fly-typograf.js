const path = require('path');

module.exports = {
  entry: {
		"example": path.join(__dirname, './src/example.js')
	},
	output: {
		path: path.resolve(__dirname, 'example'),
		filename: '[name].js'
	},
	devServer: {
		static: './example',
		compress: true,
		hot: true
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
