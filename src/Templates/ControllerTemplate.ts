import {IFileTemplate} from "./IFileTemplate";

export default  class ControllerTemplate implements IFileTemplate {
  language ='TS';
  import = ["b",'c'];
  extends = ["Controller, a"];
  constructor_params= [];
  abstract_method= [];
}