import {WriteStream, createWriteStream} from "fs";
import {touchDir} from '../Common/FileSystem';
import {CLIDefaultValues} from "../CLIDefaultValues";
import  * as templates from  "../Templates/AllFileTemplates"
import {IFileTemplate} from "../Templates/IFileTemplate";

 function checkTemplate(type: string) : boolean{
    return type in templates;
}

function  getTemplate(type: string) : IFileTemplate|null {
    if (checkTemplate(type)) {
        return new templates[type]();
    } else return null;
}

function  writeTSFile(path:string, file_name:string, type:string, to_drop:boolean) :void {
     console.log('writing to '+ path+'/'+file_name+'.ts');
    let data : WriteStream = createWriteStream (path+'/'+file_name+'.ts');

    let template: IFileTemplate | null = getTemplate(type);
    if (template !== null) {
        if (template.language !== 'TS')  {
            console.log('Generate implement currently just for TypeScript...');
            return;
        }
        // Intersection all classes that need to be import
        let needToImport :string [] = template.import;
        needToImport= needToImport.concat(template.implements.filter(function (item) {
                return needToImport.indexOf(item) === -1;
            }));
        console.log(needToImport);

        if (template.extends && !(template.extends in needToImport)) {
            needToImport.push(template.extends);
        }

        let imports :string = `import {${alignArray(needToImport)}} from \'ahrakio\';\n`;
        console.log(imports);
        data.write(imports);
        let definition : string = `export default class ${file_name} `;
        if (template.extends) {
            definition += `extends ${template.extends} `
        }
        if (template.implements.length > 0) {
            definition += `implements ${alignArray(template.implements)} `;
        }
        definition += '{\n';
        console.log(definition);
        data.write(definition);
        let constructorFn :string = `\tconstructor(${alignArray(template.constructor_params)}) {\n`;
        if (template.extends) {
            constructorFn += `\t\tsuper(${alignArray(template.constructor_params)});\n`;
        }
        constructorFn += '\t}\n';
        console.log(constructorFn);
        data.write(constructorFn + '}');


    } else {
        console.log('failed to get '+ type + " template.");
        return;
    }
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
}

function  alignArray(arr: string []) : string {
    return JSON.stringify(arr).replace(/["'\[\]]/gi, "").replace(/,/gi,', ');
}



export class GenerateCommand implements ICommand {
    name: string;
    alias: string;
    params: string[];
    description: string;
    options: IOption[];

    constructor() {
        this.name = 'generate';
        this.alias = 'gn';
        this.params =  ['type', 'filename'];
        this.description = 'generate new component from given type';
        this.options = [
            { 
                name: "path",
                char: "p",
                params: ["path"],
                description:"set file location"
            }, 
            {
                name: "drop",
                char : 'd',
                params: [], 
                description: "drop comments"
            }
        ];  
    }



    public handler (type:string , filename:string, options:any) :void {
        if ((-1 === Object.keys(CLIDefaultValues.innerPaths).indexOf(type))) {
            console.log('invalid type: ' + type);
            console.log('valid types are: ' + JSON.stringify(Object.keys(CLIDefaultValues.innerPaths)));
            return;
        }


        if (!checkTemplate(type)) {
            console.log('failed to find template for '+ type);
            return;
        }
        let path:string = (options && options.path) ? options.path : CLIDefaultValues.innerPaths[type];
        touchDir(path);
        let className = (options && options.strict) ? filename : filename+type[0].toUpperCase() + type.slice(1).toLowerCase();
        writeTSFile(path, className, type, options ? (!!options.drop) : false);
    };

}