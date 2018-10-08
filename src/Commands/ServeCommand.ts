import { Command } from "commander";
import { CommandAbstract } from "./CommandAbstract";
import * as path from "path";
import webpack from "webpack";
import { findFile } from "../Common/FileSystem";
const spawn = require("child_process").spawn;

// Webpack plugins
const CleanWebpackPlugin = require("clean-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const WebpackBar = require("webpackbar");

export class ServeCommand extends CommandAbstract {
    constructor() {
        super();

        this.name = "serve";
        this.alias = "s";
        this.params = [];
        this.description = "Serve the project for dev-server";
        this.options = [
            {
                name: "port",
                char: "p",
                params: ["port"],
                description: "Set the port of the dev-server. Default is 8400"
            }
        ];
    }

    protected handle(command: Command): void {
        let cli_path = path.resolve(__dirname, "..");
        let proj_path = process.cwd();

        console.log(cli_path);
        console.log(proj_path);

        if (findFile("witty.json") === null) {
            console.log("Not in a witty project folder");
            return;
        }

        let child: any = null;
        let entryPath = path.resolve(proj_path, "index.ts");
        let outputPath = path.resolve(proj_path, "serve");

        process.chdir(cli_path);

        let config = {
            entry: entryPath,
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
                path: outputPath
            },
            target: "node",
            node: {
                __dirname: false,
                __filename: false
            },
            mode: "development",
            plugins: [
                new CleanWebpackPlugin(outputPath, { watch: true }),
                new UglifyJsPlugin(),
                new webpack.ProgressPlugin((percentage, msg) => {
                    if (percentage === 0) {
                        if (child !== null) {
                            child.kill("SIGKILL");
                            child = null;
                        }
                    } else if (percentage === 1) {
                        let options = {
                            cwd: outputPath
                        };

                        let args: string[] = [outputPath + "/index.js"];

                        if (command.port !== undefined) {
                            args.push(command.port);
                        }

                        child = spawn("node", args, options);
                    }
                }),
                new WebpackBar({
                    name: "Witty"
                })
            ]
        };

        const compiler = webpack(config);
        compiler.watch(
            {
                aggregateTimeout: 1000,
                poll: 1000
            },
            (a, stats) => {
                console.log(a, stats);
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
            }
        );
    }
}
