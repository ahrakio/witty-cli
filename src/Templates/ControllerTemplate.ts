import { IFileTemplate } from "./IFileTemplate";
import {AbstractClassTemplate} from "./AbstractClassTemplate";

export default class ControllerTemplate extends AbstractClassTemplate implements IFileTemplate {

    constructor() {
        super();
        this.class.extends = "Controller";
;
    }
}