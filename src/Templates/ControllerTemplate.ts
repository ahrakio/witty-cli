import { IFileTemplate } from "./IFileTemplate";
import {IParamTemplate} from "./IParamTemplate";
import {IMethodTemplate} from "./IMethodTemplate";

export default class ControllerTemplate implements IFileTemplate {
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
        this.extends = "Controller";
        this.constructor_params = [];
        this.abstract_method = [];
    }
}