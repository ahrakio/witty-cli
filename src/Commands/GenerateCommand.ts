import {WriteStream, createWriteStream, readFileSync} from "fs";
import {chdir} from 'process';
import {touchDir, readJsonFile, findFile} from '../Common/FileSystem';
import  * as templates from  "../Templates/AllFileTemplates"
import {IFileTemplate} from "../Templates/IFileTemplate";
import {CommandAbstract} from "./CommandAbstract";
const json_file = "witty.json";

/*


 readStream
     .on('data', function(chunk) {
         // set name
         chunk = chunk.toString().replace(/~name/gi, file_name);
         if (to_drop) {
             // drop comments
             if (! skip_block_comment) {
                 let slice_start = chunk.indexOf('/*');
                 if (slice_start !== -1) {
                     skip_block_comment = true;
                     //let slice_end = chunk.indexOf('*//*') ;
                        if (slice_end !== -1) {
                            chunk = chunk.slice(0,slice_start) + chunk.slice(slice_end +2);
                            skip_block_comment =false;
                        } else {
                            chunk = chunk.slice(0, slice_start);
                        }
                    }
                } else {
                    let slice_end = chunk.indexOf('*//*');
                    if (slice_end !== -1) {
                        chunk = chunk.slice(slice_end + 2);
                        skip_block_comment =false;
                    } else {
                        chunk = '';
                    }
                }
            }
            data.write(chunk);
        })
        .on('end', function() {
            data.close();
            console.log(file_name + ' is written!');
        });*/



export class GenerateCommand extends CommandAbstract {
     constructor() {
        super();
        this.name = 'generate';
        this.alias = 'gn';
        this.params =  ['type', 'filename'];
        this.description = 'generate new component from given type';
        this.options = [
            { 
                name: "path",
                char: "p",
                params: ["path"],
                description:"set file location."
            }, 
            {
                name: "strict",
                char : 's',
                params: [], 
                description: "don't concat type name to class name."
            }
        ];  
    }
    private checkTemplate(type: string) : boolean{
        return type in templates;
    }

    private getTemplate(type: string) : IFileTemplate|null {
        if (this.checkTemplate(type)) {
            return new templates[type]();
        } else return null;
    }

    private editApp(app_path:string, type:string, new_class:string, new_path:string):void {
        if (!app_path) {
            console.log('inlaid path to App.ts');
            return;
        }
        let delim = app_path[app_path.length-1] === '\\' ? '' : '\\';
        try {
            let old:string = readFileSync(`${app_path}${delim}App.ts`,'ascii');
            let regex:RegExp = new RegExp(`${type}s\\s*:\\s*\\[`,'i');
            let found = old.match(regex);
            let index:number = found.index + found[0].length;
            let sperator = old.indexOf(']', index) < old.indexOf(',', index) ? '' :  ',' ;
            let new_app = `import { ${new_class} } from "${new_path}/${new_class}";\n${old.slice(0, index)}\n\t\t${new_class}${sperator}${old.slice(index)}`;
            let data: WriteStream = createWriteStream(`${app_path}${delim}App.ts`);
            data.write(new_app);
            console.log('App.ts rewrite!');

        } catch (err){
            console.log('failed to rewrite App.ts');
            console.log(err);
            return;
        }
     }


    private writeTSFile(path:string, file_name:string, type:string) :boolean {
        console.log('writing to ' + path + '/' + file_name + '.ts');
        let data: WriteStream = createWriteStream(path + '/' + file_name + '.ts');

        let template: IFileTemplate | null = this.getTemplate(type);
        if (template !== null) {
            if (template.language !== 'TS') {
                console.log('Generate implement currently just for TypeScript...');
                return false;
            }
            // Intersection all classes that need to be import
            let needToImport: string [] = template.import;
            needToImport = needToImport.concat(template.implements.filter(function (item) {
                return needToImport.indexOf(item) === -1;
            }));

            if (template.extends && !(template.extends in needToImport)) {
                needToImport.push(template.extends);
            }

            let imports: string = `import {${needToImport.join(', ')}} from \'ahrakio\';\n`;
            data.write(imports);
            let definition: string = `export class ${file_name} `;
            if (template.extends) {
                definition += `extends ${template.extends} `
            }
            if (template.implements.length > 0) {
                definition += `implements ${template.implements.join(', ')} `;
            }
            definition += '{\n';
            data.write(definition);

            let constructorParams: string [] = template.constructor_params.map(param => `${param.name} :${param.type}`);
            let constructorFn: string = `\tconstructor(${constructorParams.join(', ')}) {\n`;

            if (template.extends) {
                constructorFn += `\t\tsuper(${template.constructor_params.map(param => param.name).join(', ')});\n`;
            }
            constructorFn += '\t}\n';

            data.write(constructorFn);

            let abstract_methods: string[] = template.abstract_method
                .map(method => `\t${method.name}(${method.params
                    .map(param => `param => \`${param.name} :${param.type}`).join(', ')}) : ${method.returns} {\n
                    \t\treturn \/\/ ${method.returns}\n\t}`);

            data.write(abstract_methods + '\n}');
            //data.close();
            return true;

        } else {
            console.log('failed to get ' + type + " template.");
            return false;
        }
    }

    private getTypeList () : string[]{
         return Object.keys(templates);
    };


    public handle (type:string , filename:string, options:any) :void {
        // check type existence
        if (!this.checkTemplate(type)) {
            console.log('invalid type: ' + type);
            console.log('valid types are: ' + JSON.stringify(this.getTypeList()));
            return;
        }
        // read json data
        let project_path:string|null = findFile(json_file);
        if (project_path === null) {
            console.log('failed to find '+ json_file);
            return;
        }
        chdir(project_path);

        let json_obj = readJsonFile(`./${json_file}`);
        if (json_obj === null || !("defaultPaths" in json_obj)) {
            console.log(`failed to parse ${json_file}`);
            return;
        }
        // get file path
        let path:string;
        if (options && options.path) {
            path = options.path
        } else  {
            if (!(type in json_obj["defaultPaths"])) {
                console.log(`failed to find path in ${json_file}`);
                return;
            }
            path = json_obj["defaultPaths"][type];
        }
        // build the path if isn't exist
        touchDir(path);
        // define filename
        let className = (options && options.strict) ? filename : filename+type[0].toUpperCase() + type.slice(1).toLowerCase();
        // write file from template
        if(this.writeTSFile(path, className, type)){
            this.editApp(json_obj["defaultPaths"]["app"], type, className, path);
        }
    }

}