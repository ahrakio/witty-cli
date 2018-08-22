export interface IFileTemplate {
    language: string;
    import: string[];
    implements: string[];
    extends?: string;
    constructor_params :string[];
    abstract_method :string[];
}