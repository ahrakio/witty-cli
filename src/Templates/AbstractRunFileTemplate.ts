import {IMethodTemplate} from "./IMethodTemplate";

export abstract class AbstractRunFileTemplate {
    language: string;
    import: string[];
    global_code: string;
    methods :IMethodTemplate[];
    constructor() {
        this.language = 'TS';
        this.import = [];
        this.global_code = '';
        this.methods = [];
    }
}