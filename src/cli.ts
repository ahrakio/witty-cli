import commander, { Command } from 'commander';
import { CommandAbstract } from './Commands/CommandAbstract';
import * as commands from "./Commands/CLICommands";


interface ExtendedOptions extends commander.CommandOptions {
    isNew: any;
}

commander.version('0.1.0');

for (let command_name in commands) {
    

    let command: CommandAbstract = new (commands[command_name])();
    let default_params: string = " " + command.Params.map(param => `<${param}>`).join(' ');

    let cmd_instance: Command = 
        commander 
            .command(command.Name + default_params)
            .description(command.Description)
            .alias(command.Alias);

   for (let i = 0; i < command.Options.length; i++) {
       cmd_instance
            .option(`-${command.Options[i].char} --${command.Options[i].name} ` +
            command.Options[i].params.map(param => `<${param}>`).join(' '), command.Options[i].description);
    }

    cmd_instance
        .action(command.handler());
}

commander.parse(process.argv);



