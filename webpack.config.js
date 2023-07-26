module.exports = {
  entry: {
		filename: '/src/fly-typograf.js'
	},
  output: {
		path: __dirname + '/dist',
    filename: 'fly-typograf.min.js',
		libraryTarget: 'umd'
  }
};
