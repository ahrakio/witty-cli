import {execSync} from 'child_process';
import {chdir} from 'process';
import {CommandAbstract} from './CommandAbstract';
import {TemplateGenerator} from "../Templates/TemplateGenerator";
import {AppTemplate} from "../Templates/AppTemplate";
import {touchDir, writeJsonFile} from "../Common/FileSystem"
import {IndexTemplate} from "../Templates/IndexTemplate";
import {ApiTemplate} from "../Templates/ApiTemplate";

export class NewProjectCommand extends CommandAbstract {
    constructor() {
        super();
        this.alias = 'nw';
        this.name = 'new';
        this.description = "create new witty project.";
        this.params = ['projectName'];
        this.options =[];
    }

    handle(name:string, options:any) {
        console.log ('start create new project ' + name);
        touchDir(name);
        chdir(`./${name}`);
        console.log('start npm init');
        let init_outpot = execSync('npm init -y', {encoding:'ascii'});
        console.log(init_outpot);
        console.log('start install npm witty dependencies');
        let install_outpot = execSync('npm install @ahrakio/witty-core', {encoding:'ascii'});
        console.log(install_outpot);

        let witty_obj = {
            "defaultPaths": {
                "app": ".",
                "controller": "./app/http/controllers",
                "middleware": "./app/http/middlewares"
            },
            "metadata": {}
        };

        let structure_obj = {
                "connections": [
                    {
                        "name": "",
                        "protocol": "HTTP",
                        "host": "127.0.0.1",
                        "port": 8400
                    }
                ],
                "microservices": []
            };

        let generator = new TemplateGenerator();
        console.log('start create project files.');
        if (generator.writeTSFileFromTemplate(witty_obj.defaultPaths.app, "App", new AppTemplate())) {
            let path_to_api : string = "./app/http/routes";
            touchDir(path_to_api);
            if (generator.writeTSFileFromTemplate(path_to_api, 'api', new ApiTemplate())) {
                if (generator.writeTSFileFromTemplate('.', 'index', new IndexTemplate())) {
                    let tsconfig = {
                        "compilerOptions": {
                            "target": "es6", /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017','ES2018' or 'ESNEXT'. */
                            "module": "commonjs", /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', or 'ESNext'. */
                            "declaration": false, /* Generates corresponding '.d.ts' file. */
                            "strict": true, /* Enable all strict type-checking options. */
                            "noImplicitAny": false, /* Raise error on expressions and declarations with an implied 'any' type. */
                            "strictPropertyInitialization": false, /* Enable strict checking of property initialization in classes. */
                            "moduleResolution": "node", /* Specify module resolution strategy: 'node' (Node.js) or 'classic' (TypeScript pre-1.6). */
                            "esModuleInterop": true, /* Enables emit interoperability between CommonJS and ES Modules via creation of namespace objects for all imports. Implies 'allowSyntheticDefaultImports'. */
                            "experimentalDecorators": true, /* Enables experimental support for ES7 decorators. */
                        },
                        "include": [
                            "**/*"
                        ]
                    };
                    if (writeJsonFile(witty_obj, './witty.json')) {
                        if (writeJsonFile(tsconfig, './tsconfig.json')) {
                            console.log('project '+ name + ' created successfully.');
                            if (writeJsonFile(structure_obj, './structure.json')) {
                                console.log('project '+ name + ' created successfully.');
                            } else {
                                console.log("failed to create tsconfig.json");
                            }
                        } else {
                            console.log("failed to create tsconfig.json");
                        }
                    } else {
                        console.log("failed to create witty.json");
                    }
                } else {
                    console.log("failed to create index.ts");
                }
            } else {
                console.log("failed to create api.ts");
            }
        } else {
            console.log("failed to write App.ts at "+ witty_obj.defaultPaths.app);
        }



    }
}