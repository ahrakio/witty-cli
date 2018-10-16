import {AbstractRunFileTemplate} from "./AbstractRunFileTemplate";
import {IFileTemplate} from "./IFileTemplate";

export class IndexTemplate extends AbstractRunFileTemplate implements IFileTemplate {
    constructor() {
        super();
        this.global_code =
            "import \"./app/http/routes/api\";\n" +
            "import \"./structure.json\";\n" +
            "import { App } from \"./App\";\n\n" +
            "let app = new App();\n\n" +
            "app.bootstrap();"
    }
}