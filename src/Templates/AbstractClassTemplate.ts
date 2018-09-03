import {IClassTemplate} from "./IClassTemplate";
import {IMethodTemplate} from "./IMethodTemplate";

export abstract class AbstractClassTemplate {
    language: string;
    import: string[];
    global_code: string;
    class: IClassTemplate;
    methods :IMethodTemplate[];
    constructor() {
        this.language = 'TS';
        this.import = [];
        this.global_code = '';
        this.methods = [];
        this.class = {implements:[], constructor_params:[]};
    }
}