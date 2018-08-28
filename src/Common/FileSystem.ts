import {existsSync, mkdirSync, readFileSync, realpathSync} from "fs";

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

export function readJsonFile (path:string) : object {
    try {
           return JSON.parse(readFileSync(path, "ascii"));
       } catch {
        return null;
    }
}

/**
 * will return that path of file or null if not found. (search only recursive up)
  */
export function findFile (name:string) :string | null {
    let candidate = realpathSync(`.\\`);
    while (candidate.indexOf('\\')!== -1) {
        if (existsSync(`${candidate}\\${name}`)) {
            return candidate;
        }
        candidate = candidate.slice(0, candidate.lastIndexOf('\\'))
    }
    return null;
}