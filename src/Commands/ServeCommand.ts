import { Command } from 'commander';
import { CommandAbstract } from './CommandAbstract';
import * as path from 'path';
import webpack from 'webpack';
const spawn = require('child_process').spawn;

// Webpack plugins
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const WebpackBar = require('webpackbar');


// Clean configurations
const clean_paths = [
    path.resolve(__dirname, '../../../witty-project/dist')
];

const clean_options = {
    watch: true
};

export class ServeCommand extends CommandAbstract {
    constructor() {
        super();
        
        this.name = 'serve';
        this.alias = 's';
        this.params =  [];
        this.description = 'Serve the project for dev-server';
        this.options = [
            { 
                name: 'port',
                char: 'p',
                params: ['port'],
                description: 'Set the port of the dev-server. Default is 8400'
            }
        ];  
    }

    protected handle(command: Command): void {
        process.chdir(path.resolve(__dirname, '../..'));
        let cwd = process.cwd();

        let child: any = null;
        let entryPath = path.resolve(cwd, '../witty-project/index.ts');
        let outputPath = path.resolve(cwd, 'serve');

        let config = {
            entry: entryPath,
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        use: 'ts-loader',
                        exclude: /node_modules/
                    }
                ]
            },
            resolve: {
                extensions: ['.ts', '.js']
            },
            output: {
                filename: 'index.js',
                path: outputPath,
            },
            target: 'node',
            mode: 'development',
            plugins: [
                new CleanWebpackPlugin(clean_paths, clean_options),
                new UglifyJsPlugin(),
                new webpack.ProgressPlugin((percentage, msg) => {
                    if (percentage === 0) {
                        if (child !== null) {
                            child.kill('SIGKILL');
                            child = null;
                        }
                    } else if (percentage === 1) {
                        let args: string[] = [
                            outputPath + '/index.js'
                        ];
        
                        if (command.port !== undefined) {
                            args.push(command.port);
                        }
                
                        child = spawn('node', args);
                    }
                }),
                new WebpackBar({
                    name: 'Witty'
                })
            ]
        };

        const compiler = webpack(config);
        compiler.watch({
            aggregateTimeout: 1000,
            poll: 1000,
            ignored: ['node_modules']
        }, (a, stats) => {
            const info = stats.toJson();
            if (stats.hasErrors()) {
                console.error(info.errors);
            }

            if (stats.hasWarnings()) {
                console.warn(info.warnings);
            }

            console.log(stats.toString({
                colors: true,
                modules: false,
                version: false
            }));
        });
    }
}