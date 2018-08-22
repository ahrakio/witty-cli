import {WriteStream, createWriteStream} from "fs";
import {touchDir} from '../Common/FileSystem';
import {CLIDefaultValues} from "../CLIDefaultValues";
import  * as templates from  "../Templates/AllFileTemplates"
import {IFileTemplate} from "../Templates/IFileTemplate";

function writeTSFile(path:string, file_name:string, type:string, to_drop:boolean) {
    let data : WriteStream = createWriteStream (path+'/'+file_name+'.ts');

    let template: IFileTemplate | null = getTemplate(type);
    if (template !== null) {
        console.log(JSON.stringify(template));

        if (template.language !== 'TS')  {
            console.log('Generate implement currently just for TypeScript...');
            return;
        }
        // Intersection all classes that need to be import
        /*
        let needToImport :string[] = template.extends.concat(template.import.filter(function (item) {
            return template.extends.indexOf(item) < 0;
        }));*/

        let definition : string = `export default class ${file_name} `;
        if (template.extends.length > 0) {
            let implements_classes :string = JSON.stringify(template.extends).replace(/["'\[]/gi, "")
                .replace(/]/gi,' ');
            definition += `implements ${implements_classes} {`;
            console.log(definition);
        }


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
function checkTemplate(type: string) {
    return type in templates;
}

function getTemplate(type: string) : IFileTemplate|null {
    if (checkTemplate(type)) {
        return new templates[type]();
    } else return null;
}

export class Generate implements ICommand {
    name: string = 'generate';
    alias: string = 'gn';
    params: string[] = ['type', 'filename'];
    description: string = 'generate new component from given type';
    options: IOption[] = [
        { name: "path",
            char: "p",
            params: ["path"],
            description:"set file location"

        }, {
        name: "drop", char : 'd', params: [], description: "drop comments"
        }
    ];
    handler: (...args: any[]) => void = function (type:string , filename:string, options:any) {
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