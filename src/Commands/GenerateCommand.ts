import {WriteStream, createWriteStream, readFileSync} from "fs";
import {chdir} from 'process';
import {sep} from 'path';
import {touchDir, readJsonFile, findFile} from '../Common/FileSystem';
import  * as templates from  "../Templates/AllFileTemplates"
import {IFileTemplate} from "../Templates/IFileTemplate";
import {CommandAbstract} from "./CommandAbstract";
import {TemplateGenerator} from "../Templates/TemplateGenerator";

const json_file = "witty.json";

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
        let delim = app_path[app_path.length-1] === sep ? '' : sep;
        try {
            let app_path_final = `${app_path}${delim}App.ts`;
            let old:string = readFileSync(app_path_final,'ascii');
            let regex:RegExp = new RegExp(`${type}s\\s*:\\s*\\[`,'i');
            let found = old.match(regex);
            let index:number = found.index + found[0].length;
            let res = old.slice(index).match(/^\s*(\w+,?\s*)+]/);
            let separator = res ? ',' :  '\n\t' ;
            let new_app = `import { ${new_class} } from "${new_path}/${new_class}";\n${old.slice(0, index)}\n\t\t${new_class}${separator}${old.slice(index)}`;
            let data: WriteStream = createWriteStream(app_path_final);
            data.write(new_app);
            console.log('App.ts rewrite!');

        } catch (err){
            console.log('failed to rewrite App.ts');
            console.log(err);
            return;
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

        let json_obj = readJsonFile(`${process.cwd()}${sep}${json_file}`);
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
        let template: IFileTemplate | null = this.getTemplate(type);
        let generator = new TemplateGenerator();
        if (template !== null) {
            if (generator.writeTSFileFromTemplate(path, className, template)) {
                this.editApp(json_obj["defaultPaths"]["app"], type, className, path);
            }
        } else {
            console.log('failed to get ' + type + " template.");
        }
    }

}