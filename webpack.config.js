const webpack = require("webpack");

const CleanWebpackPlugin = require("clean-webpack-plugin");
var nodeExternals = require("webpack-node-externals");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const path = require("path");
const WebpackBar = require("webpackbar");
const DeclarationFilesPlugin = require("@ahrakio/witty-webpack-declaration-files");

// Clean configurations
const clean_paths = ["dist"];

const clean_options = {
	watch: true
};

module.exports = {
	entry: "./src/index.ts",
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: "ts-loader"
            }
        ]
	},
	externals: [
        nodeExternals({
			modulesFromFile: true
		})
    ],
	optimization: {
		minimize: false
	},
	resolve: {
		extensions: [".ts", ".js"]
	},
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
		libraryTarget: "commonjs",
		library: "bundle"
	},
	target: "node",
	node: {
		__dirname: false,
		__filename: false
	},
	mode: "production",
	plugins: [
        new CleanWebpackPlugin(clean_paths, clean_options),
        new UglifyJsPlugin(),
        new WebpackBar({
			name: "Witty"
		}),
        new DeclarationFilesPlugin({
			merge: true,
			include: ["CommandAbstract", "IOption"]
		}),
        new webpack.BannerPlugin({
			banner: "#!/usr/bin/env node",
			raw: true
		})
    ]
};
