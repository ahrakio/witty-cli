import { IFileTemplate } from "./IFileTemplate";

export default class MiddlewareTemplate implements IFileTemplate {
    language: string;
    import: string[];
    extends: string;
    implements: string[];
    constructor_params: string[];
    abstract_method: string[];
    
    constructor() {
        this.language = 'TS';
        this.import = [];
        this.implements = [];
        this.extends = "Middleware";
        this.constructor_params = [];
        this.abstract_method = ['handle'];
    }
}