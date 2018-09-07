import {IParamTemplate} from "./IParamTemplate";
import {IDecoratorTemplates} from "./IDecoratorTemplates";

export interface IMethodTemplate {
    name: string;
    params:  IParamTemplate[];
    method_decorators?: IDecoratorTemplates[];
    returns: string;
    default_return: string;
}