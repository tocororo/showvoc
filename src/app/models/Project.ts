import { Settings } from './Plugins';
import { OntoLex, OWL, RDFS, SKOS, SKOSXL } from './Vocabulary';

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
    private facets: Settings;
    private description: string;

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

    public setHistoryEnabled(enabled: boolean) {
        this.historyEnabled = enabled;
    }

    public isHistoryEnabled(): boolean {
        return this.historyEnabled;
    }

    public setValidationEnabled(enabled: boolean) {
        this.validationEnabled = enabled;
    }

    public isValidationEnabled(): boolean {
        return this.validationEnabled;
    }

    public setModelType(modelType: string) {
        this.model = modelType;
    }
    public getModelType(prettyPrint?: boolean): string {
        if (prettyPrint) {
            return Project.getPrettyPrintModelType(this.model);
        }
        return this.model;
    }

    public setLexicalizationModelType(lexicalizationModel: string) {
        this.lexicalizationModel = lexicalizationModel;
    }
    public getLexicalizationModelType(prettyPrint?: boolean): string {
        if (prettyPrint) {
            return Project.getPrettyPrintModelType(this.lexicalizationModel);
        }
        return this.lexicalizationModel;
    }

    public static getPrettyPrintModelType(modelType: string) {
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
        } else {
            return modelType;
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

    public setDescription(description: string) {
        this.description = description;
    }
    public getDescription(): string {
        return this.description;
    }

    public setFacets(facets: Settings) {
        this.facets = facets;
    }

    public getFacets(): Settings {
        return this.facets;
    }
}

export enum BackendTypesEnum {
    graphdb_FreeSail = "graphdb:FreeSail",
    openrdf_NativeStore = "openrdf:NativeStore",
    openrdf_MemoryStore = "openrdf:MemoryStore"
}

export enum AccessLevel {
    R = "R",
    RW = "RW"
}

export class Repository {
    public id: string;
    public location: string;
    public description: string;
    public readable: boolean;
    public writable: boolean;
}

export class RepositorySummary {
    public id: string;
    public description: string;
    public remoteRepoSummary: RemoteRepositorySummary;
}
export class RemoteRepositorySummary {
    public serverURL: string;
    public repositoryId: string;
    public username: string;
    public password: string;
}

export enum RepositoryAccessType {
    CreateLocal = "CreateLocal",
    CreateRemote = "CreateRemote",
    AccessExistingRemote = "AccessExistingRemote",
}

export class RepositoryAccess {
    private type: RepositoryAccessType;
    private configuration: RemoteRepositoryAccessConfig;

    constructor(type: RepositoryAccessType) {
        this.type = type;
    }

    public setConfiguration(configuration: RemoteRepositoryAccessConfig) {
        this.configuration = configuration;
    }

    public stringify(): string {
        let repoAccess: any = {
            "@type": this.type,
        };
        //if the repository access is remote, add the configuration
        if (this.type == RepositoryAccessType.CreateRemote || this.type == RepositoryAccessType.AccessExistingRemote) {
            repoAccess.serverURL = this.configuration.serverURL;
            repoAccess.username = this.configuration.username;
            repoAccess.password = this.configuration.password;
        }
        return JSON.stringify(repoAccess);
    }
}

export class RemoteRepositoryAccessConfig {
    public serverURL: string;
    public username: string;
    public password: string;
}

export class ExceptionDAO {
    public message: string;
    public type: string;
    public stacktrace: string;
}

export enum ProjectFacets {
    dir = "dir",
    prjHistoryEnabled = "prjHistoryEnabled",
    prjLexModel = "prjLexModel",
    prjModel = "prjModel",
    prjValidationEnabled = "prjValidationEnabled",
}

export enum ProjectViewMode {
    list = "list",
    facet = "facet",
}

export class ProjectUtils {

    //history and validation are not foreseen in SV
    public static projectFacetsTranslationStruct: { facet: ProjectFacets, translationKey: string }[] = [
        // { facet: ProjectFacets.prjHistoryEnabled, translationKey: "MODELS.PROJECT.HISTORY" },
        { facet: ProjectFacets.prjLexModel, translationKey: "MODELS.PROJECT.LEXICALIZATION" },
        { facet: ProjectFacets.prjModel, translationKey: "MODELS.PROJECT.MODEL" },
        // { facet: ProjectFacets.prjValidationEnabled, translationKey: "MODELS.PROJECT.VALIDATION" }
    ];

}