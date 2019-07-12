import { IRI, Literal } from './Resources';
import { ResourceUtils } from '../utils/ResourceUtils';

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
    linkPredicate?: IRI;
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
        }
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
            }
        } else {
            return { id: null, limitations: null }
        }
        
    }
}