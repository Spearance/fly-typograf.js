module.exports = {
  entry: {
		filename: '/src/example.js'
	},
  output: {
		path: __dirname + '/dist',
    filename: 'typograf.min.js',
		iife: true
  }
};
