import {existsSync, mkdirSync} from "fs";


export function touchDir(path:string) :void {
    if (existsSync(path)) return;
    let dirNames:string []  = path.split('/');
    let soFar = "./";
    for (let i=0; i< dirNames.length; ++i) {
        let dirName : string = dirNames[i];
        soFar = soFar + '/' + dirName;
        if (!existsSync(soFar)) {
            mkdirSync(soFar);
            console.log(dirName+ ' is created!');
        }
    }
}