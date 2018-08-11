#!/usr/bin/env node
import program = require ('commander');
import {Generate} from  "./Commands/Generate"
let command = new Generate();

let i = 0;

// generate command
program
    .version('0.1.0')
    .command(command.name+" <"+ command.params[0] + "> <" + command.params[1]+">")
    .alias(command.alias)
    .description(command.description)
    .option('-' + command.options[i].char +', --' + command.options[i].name+' <' +
                command.options[i].params[0]+'>', 'set file location')
    .option('-'+ command.options[i+1].char+', --'+command.options[i+1].name, 'drop comments')
    .action(command.handler);

// main parse
program.parse(process.argv);

