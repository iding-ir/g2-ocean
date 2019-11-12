const path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    // vendor: "./src/vendor.js",
    main: "./src/index.js"
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
    new CopyPlugin([
      { from: "src/assets", to: "assets" },
      { from: "src/data", to: "data" }
    ]),
  ],
  module: {
    rules: [
      {
        test: /\.html$/,
        use: ["html-loader"]
      },
      {
        test: /\.(svg|png|jpg|gif)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[hash].[ext]",
            outputPath: "imgs"
          }
        }
      }
    ]
  }
};
