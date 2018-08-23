import { IFileTemplate } from "./IFileTemplate";
import {IParamTemplate} from "./IParamTemplate";
import {IMethodTemplate} from "./IMethodTemplate";

export default class MiddlewareTemplate implements IFileTemplate {
    language: string;
    import: string[];
    extends: string;
    implements: string[];
    constructor_params: IParamTemplate[];
    abstract_method: IMethodTemplate[];
    
    constructor() {
        this.language = 'TS';
        this.import = [];
        this.implements = [];
        this.extends = "Middleware";
        this.constructor_params = [];
        this.abstract_method = [{name:'handle', params: [], returns: 'boolean|Promise<boolean>'}];
    }
}