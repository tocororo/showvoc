import { RDFS, OWL, SKOS, SKOSXL, OntoLex } from './Vocabulary';

export class Project {
    private name: string;
    private baseURI: string;
    private defaultNamespace: string;
    private accessible: boolean;
    private historyEnabled: boolean;
    private validationEnabled: boolean;
    private model: string;
    private lexicalizationModel: string;
    private open: boolean;
    private repositoryLocation: { location: "remote" | "local", serverURL?: string };
    private status: { status: string, message?: string };

    constructor(name?: string) {
        if (name != undefined) {
            this.name = name;
        }
    }

    public setName(name: string) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public setBaseURI(baseURI: string) {
        this.baseURI = baseURI;
    }

    public getBaseURI(): string {
        return this.baseURI;
    }

    public setDefaultNamespace(defaultNamespace: string) {
        this.defaultNamespace = defaultNamespace;
    }

    public getDefaultNamespace(): string {
        return this.defaultNamespace;
    }

    public setAccessible(accessible: boolean) {
        this.accessible = accessible;
    }

    public isAccessible(): boolean {
        return this.accessible;
    }

    public setHistoryEnabled(historyEnabled: boolean) {
        this.historyEnabled = historyEnabled;
    }

    public isHistoryEnabled(): boolean {
        return this.historyEnabled;
    }

    public setValidationEnabled(validationEnabled: boolean) {
        this.validationEnabled = validationEnabled;
    }

    public isValidationEnabled(): boolean {
        return this.validationEnabled;
    }

    public setModelType(modelType: string) {
        this.model = modelType;
    }
    public getModelType(prettyPrint?: boolean): string {
        if (prettyPrint) {
            return this.getPrettyPrintModelType(this.model);
        }
        return this.model;
    }

    public setLexicalizationModelType(lexicalizationModel: string) {
        this.lexicalizationModel = lexicalizationModel;
    }
    public getLexicalizationModelType(prettyPrint?: boolean): string {
        if (prettyPrint) {
            return this.getPrettyPrintModelType(this.lexicalizationModel);
        }
        return this.lexicalizationModel;
    }

    private getPrettyPrintModelType(modelType: string) {
        if (modelType == RDFS.uri) {
            return "RDFS";
        } else if (modelType == OWL.uri) {
            return "OWL";
        } else if (modelType == SKOS.uri) {
            return "SKOS";
        } else if (modelType == SKOSXL.uri) {
            return "SKOSXL";
        } else if (modelType == OntoLex.uri) {
            return "OntoLex";
        }
    }

    public setOpen(open: boolean) {
        this.open = open;
    }
    public isOpen(): boolean {
        return this.open;
    }

    public getRepositoryLocation() {
        return this.repositoryLocation;
    }
    public setRepositoryLocation(repositoryLocation: { location: "remote" | "local", serverURL?: string }) {
        this.repositoryLocation = repositoryLocation;
    }
    public isRepositoryRemote(): boolean {
        return this.repositoryLocation.location == "remote";
    }

    public setStatus(status: { status: string, message?: string }) {
        this.status = status;
    }
    public getStatus(): { status: string, message?: string } {
        return this.status;
    }

}
