import { IDecoratorTemplates } from "./IDecoratorTemplates";
import { createWriteStream, WriteStream } from "fs";
import { IFileTemplate } from "./IFileTemplate";

const npm_name = "@ahrakio/witty-core";

export class TemplateGenerator {
    constructor() {}

    public writeTSFileFromTemplate(path: string, file_name: string, template: IFileTemplate): boolean {
        console.log("writing to " + path + "/" + file_name + ".ts");
        let data: WriteStream = createWriteStream(path + "/" + file_name + ".ts");

        if (template.language !== "TS") {
            console.log("Generate implement currently just for TypeScript...");
            return false;
        }
        let needToImport: string[] = template.import;
        if (template.class) {
            let class_data = template.class;
            // Intersection all classes that need to be import

            needToImport = needToImport.concat(
                class_data.implements.filter(function(item) {
                    return needToImport.indexOf(item) === -1;
                })
            );
            if (class_data.extends && needToImport.indexOf(class_data.extends) === -1) {
                needToImport.push(class_data.extends);
            }
        }
        if (needToImport.length > 0) {
            let imports: string = `import {${needToImport.join(", ")}} from \'${npm_name}\';\n`;
            data.write(imports + "\n");
        }
        if (template.global_code.length > 0) {
            data.write(template.global_code + "\n");
        }
        if (template.class) {
            let class_data = template.class;
            if (class_data.class_decorators) {
                let class_decorator_str = "";
                for (let d in class_data.class_decorators) {
                    let decor: IDecoratorTemplates = class_data.class_decorators[d];
                    class_decorator_str += `@${decor.name} ${decor.params === "" ? "" : `(${decor.params})`}\n`;
                }
                data.write(class_decorator_str);
            }
            let definition: string = `export class ${file_name} `;
            if (class_data.extends) {
                definition += `extends ${class_data.extends} `;
            }
            if (class_data.implements.length > 0) {
                definition += `implements ${class_data.implements.join(", ")} `;
            }
            definition += "{\n";
            data.write(definition);

            let constructorParams: string[] = class_data.constructor_params.map((param) => `${param.name} :${param.type}`);
            let constructorFn: string = `\tconstructor(${constructorParams.join(", ")}) {\n`;

            if (class_data.extends) {
                constructorFn += `\t\tsuper(${class_data.constructor_params.map((param) => param.name).join(", ")});\n`;
            }
            constructorFn += "\t}\n";

            data.write(constructorFn);
        }
        let abstract_methods: string[] = template.methods.map(
            (method) => `\t${method.name}(${method.params.map((param) => `param => \`${param.name} :${param.type}`).join(", ")}) : ${
                method.returns
            } {\n
                \t\treturn ${method.default_return};\n\t}`
        );

        data.write(abstract_methods + (template.class ? "\n}" : "\n"));
        return true;
    }
}
