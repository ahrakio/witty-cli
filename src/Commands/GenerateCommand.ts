import {WriteStream, createWriteStream} from "fs";
import {touchDir} from '../Common/FileSystem';
import {CLIDefaultValues} from "../CLIDefaultValues";
import  * as templates from  "../Templates/AllFileTemplates"
import {IFileTemplate} from "../Templates/IFileTemplate";
import {CommandAbstract} from "./CommandAbstract";

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



export  class GenerateCommand extends CommandAbstract {
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

    private writeTSFile(path:string, file_name:string, type:string, to_drop:boolean) :void {
        console.log('writing to ' + path + '/' + file_name + '.ts');
        let data: WriteStream = createWriteStream(path + '/' + file_name + '.ts');

        let template: IFileTemplate | null = this.getTemplate(type);
        if (template !== null) {
            if (template.language !== 'TS') {
                console.log('Generate implement currently just for TypeScript...');
                return;
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
            let definition: string = `export default class ${file_name} `;
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


        } else {
            console.log('failed to get ' + type + " template.");
            return;
        }
    }
    private getTypeList () : string[]{
         return Object.keys(templates);
    };

     private getPathFor(type:string) :string|null {
         if (!(type in CLIDefaultValues.innerPaths)) return null;
         return CLIDefaultValues.innerPaths[type];
     }



    public handle (type:string , filename:string, options:any) :void {
        if (!this.checkTemplate(type)) {
            console.log('invalid type: ' + type);
            console.log('valid types are: ' + JSON.stringify(this.getTypeList()));
            return;
        }

        if (this.getPathFor(type) === null && (!options || !options.path)) {
            console.log('failed to find default path for '+ type);
            return;
        }
        let path:string = (options && options.path) ? options.path : this.getPathFor(type);
        touchDir(path);
        let className = (options && options.strict) ? filename : filename+type[0].toUpperCase() + type.slice(1).toLowerCase();


        this.writeTSFile(path, className, type, options ? (!!options.drop) : false);
    }

}