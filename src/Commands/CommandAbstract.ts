export abstract class CommandAbstract {
    protected name: string;
    protected alias: string;
    protected params: string[];
    protected description: string;
    protected options: IOption[];
    
    get Name(): string {
        return this.name;
    }
    
    get Alias(): string {
        return this.alias;
    }
    
    get Params(): string[] {
        return this.params;
    }
    
    get Description(): string {
        return this.description;
    }
    
    get Options(): IOption[] {
        return this.options;
    }

    protected abstract handle(...args: any[]): void;

    public handler(): (...args: any[]) => void {
        return (...args: any[]) => {
            this.handle(...args);
        };
    }
}