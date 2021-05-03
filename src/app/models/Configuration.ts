import { Settings, STProperties, Scope } from "./Plugins";

export class ConfigurationComponents {
    // static ADVANCED_GRAPH_APPLICATION_STORE = "it.uniroma2.art.semanticturkey.config.sheet2rdf.AdvancedGraphApplicationStore";
    // static EXPORTER: string = "it.uniroma2.art.semanticturkey.config.exporter.Exporter";
    // static IMPORTER: string = "it.uniroma2.art.semanticturkey.config.importer.Importer";
    // static SPARQL_PARAMETERIZATION_STORE: string = "it.uniroma2.art.semanticturkey.config.sparql.SPARQLParameterizationStore";
    // static SPARQL_STORE: string = "it.uniroma2.art.semanticturkey.config.sparql.SPARQLStore";
    // static CUSTOM_SEARCH_STORE = "it.uniroma2.art.semanticturkey.settings.search.CustomSearchStore";
    static CONTRIBUTION_STORE = {
        ID: "it.uniroma2.art.semanticturkey.config.contribution.ContributionStore",
        CONFIG_IMPL: {
            DEVELOPMENT: "it.uniroma2.art.semanticturkey.config.contribution.StoredDevResourceContributionConfiguration",
            METADATA: "it.uniroma2.art.semanticturkey.config.contribution.StoredMetadataContributionConfiguration",
            STABLE: "it.uniroma2.art.semanticturkey.config.contribution.StoredStableResourceContributionConfiguration"
        }
    }
}

export class Reference {
    public user: string;
    public project: string;
    public identifier: string;
    public relativeReference: string;

    constructor(user: string, project: string, identifier: string, relativeReference: string) {
        this.user = user;
        this.project = project;
        this.identifier = identifier;
        this.relativeReference = relativeReference;
    }

    public getReferenceScope(): Scope {
        return Reference.getRelativeReferenceScope(this.relativeReference);
    }

    public static deserialize(refJson: any): Reference {
        return new Reference(refJson.user, refJson.project, refJson.identifier, refJson.relativeReference);
    }

    public static getRelativeReferenceScope(relativeRef: string): Scope {
        if (relativeRef.startsWith("sys:")) {
            return Scope.SYSTEM;
        } else if (relativeRef.startsWith("proj:")) {
            return Scope.PROJECT;
        } else if (relativeRef.startsWith("usr:")) {
            return Scope.USER;
        } else if (relativeRef.startsWith("pu:")) {
            return Scope.PROJECT_USER;
        }
    }

    public static getRelativeReferenceIdentifier(relativeRef: string): string {
        return relativeRef.substring(relativeRef.indexOf(":")+1);
    }

}

export class ConfigurationManager {
    public id: string;
    public scope: Scope;
    public configurationScopes: Scope[];
    public systemConfigurationIdentifiers: any[]; //????
}

/**
 * Soon Configuration will extends STProperties instead of Settings (like server side) and Settings also will extends STProperties
 */
export class Configuration extends Settings {}

export class ConfigurationProperty extends STProperties {}

/**
 * Object to provide to the storeConfiguration() service
 */
export class ConfigurationObject {
    [key: string]: any
}