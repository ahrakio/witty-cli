import {IFileTemplate} from "./IFileTemplate";
import {AbstractClassTemplate} from "./AbstractClassTemplate";

export class AppTemplate extends AbstractClassTemplate implements IFileTemplate {
    constructor() {
        super();
        this.import = ['WittyApp', 'AppAbstract'];
        this.class.extends = "AppAbstract";
        this.class.class_decorators = [
                { name: 'WittyApp',
                    params: JSON.stringify({controllers: [], middlewares: []},null, "\t").replace(/["']/gi, "")
                }];
    }
}