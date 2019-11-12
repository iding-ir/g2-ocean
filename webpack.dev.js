const path = require("path");
const common = require("./webpack.common");
const merge = require("webpack-merge");
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = merge(common, {
  mode: "development",
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  devServer: {
    contentBase: path.join(__dirname, 'src'),
    // publicPath: '/dist/',
    // compress: true,
    port: 9000,
    // hot: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/template.html"
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader",
          // "sass-loader"
        ]
      }
    ]
  }
});
