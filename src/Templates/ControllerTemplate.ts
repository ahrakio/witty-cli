import { IFileTemplate } from "./IFileTemplate";

export class ControllerTemplate implements IFileTemplate {
    language: string;
    import: string[];
    extends: string[];
    constructor_params: string[];
    abstract_method: string[];
    
    constructor() {
        this.language = 'TS';
        this.import = ["b",'c'];
        this.extends = ["Controller, a"];
        this.constructor_params = [];
        this.abstract_method = [];
    }
}