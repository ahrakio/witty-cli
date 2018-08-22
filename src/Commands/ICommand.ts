interface ICommand {
    name: string,
    alias: string,
    params: string[],
    description: string,
    options: IOption[],
    handler: (...args: any[]) => void
}

interface  IOption {
    name: string,
    char: string,
    params: string[],
    description: string
}