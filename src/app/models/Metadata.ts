import { ResourceUtils } from '../utils/ResourceUtils';
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
    public identity: string;
    public uriSpace: string;
    public title: string;
    public dereferenciationSystem: string;
    public sparqlEndpointMetadata: SparqlEndpointMetadata;
    public versionInfo: string;

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

export class SparqlEndpointMetadata {
    id: string;
    limitations: string[];
    public static deserialize(metadataJson: any): SparqlEndpointMetadata {
        if (metadataJson) {
            return {
                id: ResourceUtils.parseIRI(metadataJson['@id']).getIRI(),
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