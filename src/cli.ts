#!/usr/bin/env node
import program = require ('commander');
import fs = require('fs');
import {TemplateTypes} from "./TemplateTypes";

import {ReadStream, WriteStream} from "fs";

function touchDir(dir_name:string) {
    if (!fs.existsSync(dir_name)) {
        fs.mkdir(dir_name, function (err) {
            if (err) throw err;
            console.log(dir_name+ ' created!');
        })
    }
}
function writeFile(path:string, file_name:string, type:string, to_drop:boolean) {
    let data : WriteStream = fs.createWriteStream (path+'/'+file_name+'.ts');
    let readStream: ReadStream = fs.createReadStream('./src/Templates/' + TemplateTypes[type]);
    let skip_block_comment : boolean = false;


    readStream
        .on('data', function(chunk) {
            // set name
            chunk = chunk.toString().replace(/~name/gi, file_name);
            if (to_drop) {
                // drop comments
                if (! skip_block_comment) {
                    let slice_start = chunk.indexOf('/*');
                    if (slice_start !== -1) {
                        skip_block_comment = true;
                        let slice_end = chunk.indexOf('*/') ;
                        if (slice_end !== -1) {
                            chunk = chunk.slice(0,slice_start) + chunk.slice(slice_end +2);
                            skip_block_comment =false;
                        } else {
                            chunk = chunk.slice(0, slice_start);
                        }
                    }
                } else {
                    let slice_end = chunk.indexOf('*/');
                    if (slice_end !== -1) {
                        chunk = chunk.slice(slice_end + 2);
                        skip_block_comment =false;
                    } else {
                        chunk = '';
                    }
                }
            }
            data.write(chunk);
        })
        .on('end', function() {
            data.close();
            console.log(file_name + ' is written!');
        });
}
function checkTemplate(type: string) {
    return fs.existsSync('./src/Templates/' + TemplateTypes[type]);
}

function generate(type:string , name:string, options) {
    type = type[0].toUpperCase() + type.slice(1).toLowerCase();
    if (! (type in TemplateTypes)) {
        console.log('invalid type: ' + type);
        return;
    }
    let path = options.path ? options.path : ('./' +type+'s');
    touchDir(path);
    if (!checkTemplate(type)) {
        console.log('failed to find template for '+ type);
        return;
    }
    writeFile(path, name+type, type, !!options.drop);
}
// generate command
program
    .version('0.1.0')
    .command('generate <type> <name>')
    .alias('gn')
    .description('generate new component from given type')
    .option('-p, --path <path>', 'set file location')
    .option('-d, --drop', 'drop comments')
    .action(generate);

// main parse
program.parse(process.argv);

