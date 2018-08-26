import commander from 'commander';
import {GenerateCommand} from  "./Commands/GenerateCommand"
import { BuildCommand } from './Commands/BuildCommand';
import { CommandAbstract } from './Commands/CommandAbstract';
import { ServeCommand } from './Commands/ServeCommand';

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


let command2: CommandAbstract = new BuildCommand();
commander
    .version('0.1.0')
    .command(command2.Name)
    .alias(command2.Alias)
    .description(command2.Description)
    .option('-' + command2.Options[i].char +', --' + command2.Options[i].name+' <' +
                command2.Options[i].params[0]+'>', command2.Options[i].description)
    .action(command2.handler());


let command3: CommandAbstract = new ServeCommand();
commander
    .version('0.1.0')
    .command(command3.Name)
    .alias(command3.Alias)
    .description(command3.Description)
    .option('-' + command3.Options[i].char +', --' + command3.Options[i].name+' <' +
                command3.Options[i].params[0]+'>', command3.Options[i].description)
    .action(command3.handler());
// main parse
commander.parse(process.argv);

