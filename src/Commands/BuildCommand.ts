
import { Command } from 'commander';
import { CommandAbstract } from './CommandAbstract';

export class BuildCommand extends CommandAbstract {
    constructor() {
        super();
        
        this.name = 'build';
        this.alias = 'b';
        this.params =  ['type', 'filename'];
        this.description = 'Build the project for production';
        this.options = [
            { 
                name: 'output',
                char: 'op',
                params: ['output'],
                description: 'Set the compiled project destination path. Default is ./dist'
            }
        ];  
    }

    public handle(command: Command): void {
        console.log(command);
        console.log(this);
    }
}