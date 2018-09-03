import {IMethodTemplate} from "./IMethodTemplate";
import {IClassTemplate} from "./IClassTemplate";

export interface IFileTemplate {
    language: string;
    import: string[];
    global_code: string;
    class?: IClassTemplate;
    methods :IMethodTemplate[];
}