import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "fs";
import { sep } from "path";

export function touchDir(path: string): void {
    if (existsSync(path)) return;
    let dirNames: string[] = path.split(/[\\\/]/gi);
    let soFar = process.cwd();
    for (let i = 0; i < dirNames.length; ++i) {
        let dirName: string = dirNames[i];
        soFar = soFar + sep + dirName;
        if (!existsSync(soFar)) {
            mkdirSync(soFar);
            console.log(dirName + " is created!");
        }
    }
}

export function readJsonFile(path: string): object {
    try {
        return JSON.parse(readFileSync(path, "ascii"));
    } catch {
        return null;
    }
}

export function writeJsonFile(obj: object, path: string = process.cwd()): boolean {
    try {
        writeFileSync(path, JSON.stringify(obj, null, "\t"), "ascii");
        return true;
    } catch {
        return false;
    }
}

/**
 * will return that path of file or null if not found. (search only recursive up)
 */
export function findFile(name: string): string | null {
    let candidate = process.cwd();
    while (candidate.indexOf(sep) !== -1) {
        if (existsSync(`${candidate}${sep}${name}`)) {
            return candidate;
        }
        candidate = candidate.slice(0, candidate.lastIndexOf(sep));
    }
    return null;
}
