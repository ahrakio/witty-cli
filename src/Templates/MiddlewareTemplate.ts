import {IFileTemplate} from "./IFileTemplate";
import {AbstractClassTemplate} from "./AbstractClassTemplate";

export default class MiddlewareTemplate extends AbstractClassTemplate implements IFileTemplate {
    constructor() {
        super();
        this.class.extends = "Middleware";
        this.methods = [{name:'handle', params: [], returns: 'boolean|Promise<boolean>',default_return:'true'}];
    }
}