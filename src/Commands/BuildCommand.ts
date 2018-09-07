import { Command } from "commander";
import * as path from "path";
import webpack from "webpack";
import { CommandAbstract } from "./CommandAbstract";
import { findFile } from "../Common/FileSystem";

// Webpack plugins
const CleanWebpackPlugin = require("clean-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const WebpackBar = require("webpackbar");

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
            }
        ];
    }

    protected handle(command: Command): void {
        let cli_path = path.resolve(__dirname, "../..");
        let proj_path = process.cwd();

        if (findFile("witty.json") === null) {
            console.log("Not in a witty project folder");
            return;
        }

        let entryPath = path.resolve(proj_path, "index.ts");
        let outputPath = path.resolve(proj_path, "dist");

        if (command.output !== undefined) {
            outputPath = path.resolve(proj_path, command.output);
        }

        process.chdir(cli_path);

        let config = this.prepareConfig(entryPath, outputPath);
        this.compile(config);
    }

    private prepareConfig(entryPath, outputPath) {
        return {
            entry: entryPath,
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        use: "ts-loader",
                        exclude: /node_modules/
                    }
                ]
            },
            resolve: {
                extensions: [".ts", ".js"]
            },
            output: {
                filename: "index.js",
                path: outputPath
            },
            target: "node",
            mode: "production",
            optimization: {
                minimizer: [
                    new UglifyJsPlugin({
                        uglifyOptions: {
                            keep_classnames: true
                        }
                    })
                ]
            },
            plugins: [
                new CleanWebpackPlugin(outputPath, { watch: true }),
                new WebpackBar({
                    name: "Witty"
                })
            ]
        };
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
