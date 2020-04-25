const path = require("path");
const merge = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "production",
  optimization: {
    minimizer: [new OptimizeCssAssetsPlugin(), new TerserPlugin()],
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: "[name].css" }),
    new CopyPlugin([
      {
        from: path.resolve(__dirname, "public/assets"),
        to: path.resolve(__dirname, "dist/assets"),
      },
      {
        from: path.resolve(__dirname, "public/mapcraft"),
        to: path.resolve(__dirname, "dist/mapcraft"),
      },
      {
        from: path.resolve(__dirname, "public/data"),
        to: path.resolve(__dirname, "dist/data"),
      },
    ]),
    new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
    ],
  },
});
