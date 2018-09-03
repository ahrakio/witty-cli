import {AbstractRunFileTemplate} from "./AbstractRunFileTemplate";
import {IFileTemplate} from "./IFileTemplate";

export class ApiTemplate extends AbstractRunFileTemplate implements IFileTemplate {
    constructor() {
        super();
        this.import= ['Router'];
    }
}