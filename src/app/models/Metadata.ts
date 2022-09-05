import { NTriplesUtil } from '../utils/ResourceUtils';
import { Project } from './Project';
import { AnnotatedValue, IRI, Literal } from './Resources';

export class PrefixMapping {
    public prefix: string;
    public namespace: string;
    public explicit: boolean = true;
}

export class LinksetMetadata {
    sourceDataset: IRI;
    targetDataset: Target;
    registeredTargets: Target[];
    linkCount?: number;
    linkPercentage?: number;
    linkPredicate?: IRI;

    sourceDatasetProject?: Project; //this is not included in the linkset returned by the services, 
    //this is added manually since it is useful when describing mapping from the Alignment tree

    /**
     * Returns in order (with fallback):
     * - the first registeredTargets with project name
     * - the first registeredTargets with uri space
     * - the targetDataset 
     */
    getRelevantTargetDataset(): Target {
        for (let i = 0; i < this.registeredTargets.length; i++) {
            if (this.registeredTargets[i].projectName != null) {
                return this.registeredTargets[i];
            }
        }
        //no project name found => returns uri space of registered targets
        for (let i = 0; i < this.registeredTargets.length; i++) {
            if (this.registeredTargets[i].uriSpace != null) {
                return this.registeredTargets[i];
            }
        }
        return this.targetDataset;
    }

    /**
     * If specified in the registered targets, returns the first target with the projectName, otherwise returns null.
     */
    getTargetProject(): Project {
        for (let t of this.registeredTargets) {
            if (t.projectName != null) {
                return new Project(t.projectName);
            }
        }
        return null;
    }

    /**
     * Returns the show of the relevant target dataset
     */
    getTargetDatasetShow(): string {
        let target = this.getRelevantTargetDataset();
        if (target.projectName != null) {
            return target.projectName;
        } else {
            return target.uriSpace;
        }
    }

}

export class Target {
    dataset: IRI;
    projectName: string;
    uriSpace?: string;
    titles: Literal[];
}

export class DatasetMetadata {
    identity: string;
    uriSpace: string;
    title: string;
    dereferenciationSystem: string;
    sparqlEndpointMetadata: SparqlEndpointMetadata;
    versionInfo: string;

    public static deserialize(datasetMetadataJson: any): DatasetMetadata {
        let sparqlEndpointMetadata: SparqlEndpointMetadata = SparqlEndpointMetadata.deserialize(datasetMetadataJson.sparqlEndpointMetadata);
        return {
            identity: datasetMetadataJson.identity,
            uriSpace: datasetMetadataJson.uriSpace,
            title: datasetMetadataJson.title,
            dereferenciationSystem: datasetMetadataJson.dereferenciationSystem,
            sparqlEndpointMetadata: sparqlEndpointMetadata,
            versionInfo: datasetMetadataJson.versionInfo
        };
    }
}

export class CatalogRecord2 {
    identity: IRI;
    dataset: DatasetMetadata2;
    issued: Date;
    modified?: Date;

    public static parse(catalogRecordJson: any): CatalogRecord2 {
        let record = new CatalogRecord2();
        record.identity = new IRI(catalogRecordJson.identity);
        record.dataset = DatasetMetadata2.parse(catalogRecordJson.dataset);
        record.issued = new Date(catalogRecordJson.issued);
        record.modified = catalogRecordJson.modified ? new Date(catalogRecordJson.modified) : null;
        return record;
    }
}

export class DatasetMetadata2 {

    identity: IRI;
    uriSpace: string;
    otherURISpaces: string[];
    nature: DatasetNature;
    titles: Literal[];
    projectName?: string;
    descriptions: Literal[];
    role: DatasetRole;
    versionInfo: string;
    versionNotes: string;
    dereferenciationSystem?: string;
    sparqlEndpoint?: SparqlEndpointMetadata;

    public static parse(datasetMetadataJson: any): DatasetMetadata2 {
        let dataset = new DatasetMetadata2();
        dataset.identity = new IRI(datasetMetadataJson.identity);
        dataset.uriSpace = datasetMetadataJson.uriSpace;
        dataset.otherURISpaces = datasetMetadataJson.otherURISpaces;
        dataset.nature = datasetMetadataJson.nature;
        dataset.titles = datasetMetadataJson.titles.map((t: string) => NTriplesUtil.parseLiteral(t));
        dataset.projectName = datasetMetadataJson.projectName;
        dataset.descriptions = datasetMetadataJson.descriptions.map((d: string) => NTriplesUtil.parseLiteral(d));
        dataset.role = datasetMetadataJson.role;
        dataset.versionInfo = datasetMetadataJson.versionInfo;
        dataset.versionNotes = datasetMetadataJson.versionNotes;
        dataset.sparqlEndpoint = SparqlEndpointMetadata.deserialize(datasetMetadataJson.sparqlEndpoint);
        dataset.dereferenciationSystem = datasetMetadataJson.dereferenciationSystem;
        return dataset;
    }
}

export enum DatasetNature {
    ABSTRACT = "ABSTRACT",
    PROJECT = "PROJECT",
    SPARQL_ENDPOINT = "SPARQL_ENDPOINT",
    RDF4J_REPOSITORY = "RDF4J_REPOSITORY",
    GRAPHDB_REPOSITORY = "GRAPHDB_REPOSITORY",
    MIX = "MIX"
}

export enum DatasetRole {
    ROOT = "ROOT",
    VERSION = "VERSION",
    MASTER = "MASTER",
    LOD = "LOD"
}

export interface Distribution {
    nature: IRI;
    //according the nature, the following are required
    identity?: string;
    sparqlEndpoint?: string;
    projectName?: string;
}

export interface AbstractDatasetAttachment {
    abstractDataset: string;
    relation: IRI;
    versionInfo?: string;
    versionNotes?: Literal;
}

export class SparqlEndpointMetadata {
    id: string;
    limitations?: string[];
    public static deserialize(metadataJson: any): SparqlEndpointMetadata {
        if (metadataJson) {
            return {
                id: metadataJson['@id'],
                limitations: metadataJson.limitations
            };
        } else {
            return { id: null, limitations: null };
        }

    }
}

export interface LexicalizationSetMetadata {
    identity: string;
    referenceDataset: string;
    lexiconDataset?: string;
    lexicalizationModel: string;
    language: string;
    references?: number;
    lexicalEntries?: number;
    lexicalizations?: number;
    percentage?: number;
    avgNumOfLexicalizations?: number;
}

export enum TransitiveImportMethodAllowance {
    web = "web",
    webFallbackToMirror = "webFallbackToMirror",
    mirrorFallbackToWeb = "mirrorFallbackToWeb",
    mirror = "mirror",
    nowhere = "nowhere"
}

export interface ProjectDatasetMapping {
    [project: string]: AnnotatedValue<IRI>
}