import {IParamTemplate} from "./IParamTemplate";

export interface IMethodTemplate {
    name: string;
    params:  IParamTemplate[];
    returns: string;
}