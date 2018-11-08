import { Command } from "commander";
import * as path from "path";
import webpack from "webpack";
import { CommandAbstract } from "./CommandAbstract";
import { findFile } from "../Common/FileSystem";

// Webpack plugins
const CleanWebpackPlugin = require("clean-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const WebpackBar = require("webpackbar");

let project_path;

export class BuildCommand extends CommandAbstract {
    constructor() {
        super();

        this.name = "build";
        this.alias = "b";
        this.params = [];
        this.description = "Build the project for production";
        this.options = [
            {
                name: "output",
                char: "op",
                params: ["output"],
                description: "Set the compiled project destination path. Default is ./dist"
            },
            {
                name: "dev",
                char: "dev",
                params: [],
                description: "Set the compiled project to be in dev mode"
            }
        ];
    }

    protected handle(command: Command): void {
        let cli_path = path.resolve(__dirname);
        let proj_path = process.cwd();

        if (findFile("witty.json") === null) {
            console.log("Not in a witty project folder");
            return;
        }

        let outputPath = path.resolve(proj_path, "dist");
        let mode = "production";

        // Change directory of output
        if (command.output !== undefined) {
            outputPath = path.resolve(proj_path, command.output);
        }

        if (command.dev !== undefined) {
            mode = "development";
        }

        process.chdir(cli_path);

        let config = this.prepareConfig(proj_path, outputPath, mode);
        this.compile(config);
    }

    private prepareConfig(projPath, outputPath, mode = "production") {
        let config: any = {
            entry: path.resolve(projPath, "index.ts"),
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        use: "ts-loader",
                        exclude: /node_modules/
                    },
                    {
                        type: "javascript/auto",
                        test: /\.json$/,
                        use: [
                            {
                                loader: "file-loader",
                                options: { name: "[name].[ext]" }
                            }
                        ]
                    }
                ]
            },
            resolve: {
                extensions: [".ts", ".js", ".json"]
            },
            output: {
                filename: "index.js",
                path: outputPath,
                devtoolModuleFilenameTemplate: (info) => {
                    let regex = /.*(witty-router|witty-core)(.*)/g;
                    let match = regex.exec(info.absoluteResourcePath);
                    let concat = "node_modules/@ahrakio/";
                    if (match === null) {
                        return info.absoluteResourcePath;
                    }

                    return path.join(projPath, concat, match[1], match[2]);
                }
            },
            target: "node",
            mode: mode,
            devtool: mode === "production" ? false : "source-map",
            optimization: {
                minimizer: [
                    new UglifyJsPlugin({
                        cache: true,
                        parallel: true,
                        sourceMap: true,
                        uglifyOptions: {
                            keep_classnames: true
                        }
                    })
                ]
                // minimize: false
            },
            plugins: [
                new CleanWebpackPlugin(outputPath, { watch: true }),
                new WebpackBar({
                    name: "Witty"
                })
            ]
        };

        if (mode === "development") {
            config.module.rules.push({
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre"
            });
        }

        return config;
    }

    private compile(config) {
        const compiler = webpack(config);
        compiler.run((a, stats) => {
            const info = stats.toJson();
            if (stats.hasErrors()) {
                console.error(info.errors);
            }

            if (stats.hasWarnings()) {
                console.warn(info.warnings);
            }

            console.log(
                stats.toString({
                    colors: true,
                    modules: false,
                    version: false
                })
            );
        });
    }
}
