import commander from 'commander';
import {GenerateCommand} from  "./Commands/GenerateCommand"

let command: ICommand = new GenerateCommand();
interface ExtendedOptions extends commander.CommandOptions {
    isNew: any;
}

let i = 0;

// generate command
commander
    .version('0.1.0')
    .command(command.name+" <"+ command.params[0] + "> <" + command.params[1]+">")
    .alias(command.alias)
    .description(command.description)
    .option('-' + command.options[i].char +', --' + command.options[i].name+' <' +
                command.options[i].params[0]+'>', 'set file location')
    .option('-'+ command.options[i+1].char+', --'+command.options[i+1].name, 'drop comments')
    .action(command.handler);

// main parse
commander.parse(process.argv);

