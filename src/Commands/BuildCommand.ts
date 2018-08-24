import { Command } from 'commander';
import { CommandAbstract } from './CommandAbstract';
import * as path from 'path';
import webpack from 'webpack';
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

// Clean configurations
const clean_paths = [
    path.resolve(__dirname, '../../../witty-project/dist')
];

const clean_options = {
    watch: true
};

export class BuildCommand extends CommandAbstract {
    constructor() {
        super();
        
        this.name = 'build';
        this.alias = 'b';
        this.params =  [];
        this.description = 'Build the project for production';
        this.options = [
            { 
                name: 'output',
                char: 'op',
                params: ['output'],
                description: 'Set the compiled project destination path. Default is ./dist'
            }
        ];  
    }

    protected handle(commands: Command[]): void {
        let cwd = process.cwd();
        let entryPath = path.resolve(cwd, '../witty-project/index.ts');
        let outputPath = path.resolve(cwd, '../witty-project', 'dist');

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
            mode: 'production',
            plugins: [
                new CleanWebpackPlugin(clean_paths, clean_options),
                new UglifyJsPlugin(),
            ]
        };

        const compiler = webpack(config);
        compiler.run((a, stats) => {
            const info = stats.toJson();
            if (stats.hasErrors()) {
                console.error(info.errors);
            }

            if (stats.hasWarnings()) {
                console.warn(info.warnings);
            }

            console.log(stats.toString({
                colors: true
            }));
        });
    }
}

