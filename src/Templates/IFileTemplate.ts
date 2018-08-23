import {IMethodTemplate} from "./IMethodTemplate";
import  {IParamTemplate} from "./IParamTemplate";

export interface IFileTemplate {
    language: string;
    import: string[];
    implements: string[];
    extends?: string;
    constructor_params : IParamTemplate[];
    abstract_method :IMethodTemplate[];
}