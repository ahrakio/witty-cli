import {IParamTemplate} from "./IParamTemplate";
import {IDecoratorTemplates} from "./IDecoratorTemplates";

export interface IClassTemplate {
    implements: string[];
    extends?: string;
    class_decorators? : IDecoratorTemplates [];
    constructor_params : IParamTemplate[];
}