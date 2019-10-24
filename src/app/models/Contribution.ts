import { ConfigurationComponents } from './Configuration';
import { IRI } from './Resources';

export enum ContributionType {
    metadata = "metadata",
    development = "development",
    stable = "stable"
}

export class ContributionTypeUtils {
    public static contributionMappings: { type: ContributionType, configurationID: string }[] = [
        { type: ContributionType.development, configurationID: ConfigurationComponents.CONTRIBUTION_STORE.CONFIG_IMPL.DEVELOPMENT },
        { type: ContributionType.metadata, configurationID: ConfigurationComponents.CONTRIBUTION_STORE.CONFIG_IMPL.METADATA },
        { type: ContributionType.stable, configurationID: ConfigurationComponents.CONTRIBUTION_STORE.CONFIG_IMPL.STABLE },
    ]
}

export abstract class StoredContribution {
    public static RELATIVE_REFERENCE: string = "relativeReference";
    protected abstract type: string; //not in the contribution configuration, just to be shown in the UI as "Type"
    contributorName: string;
    contributorLastName: string;
    contributorEmail: string;
    contributorOrganization: string;
    resourceName: string;
    baseURI: IRI;
}
export class StableResourceStoredContribution extends StoredContribution {
    type = "Stable";
    homepage: string;
    description: string;
    isOwner: boolean;
    model: IRI;
    lexicalizationModel: IRI;
    //metadata
    identity: IRI;
    uriSpace: string;
    dereferenciationSystem: IRI;
    sparqlEndpoint: IRI;
    sparqlLimitations: IRI[];
}
export class MetadataStoredContribution extends StoredContribution {
    type = "Metadata";
    identity: IRI;
    uriSpace: string;
    dereferenciationSystem: IRI;
    sparqlEndpoint: IRI;
    sparqlLimitations: IRI[];
}
export class DevResourceStoredContribution extends StoredContribution {
    type = "Development";
    format: string;
	homepage: string;
	description: string;
	model: IRI;
	lexicalizationModel: IRI;
}