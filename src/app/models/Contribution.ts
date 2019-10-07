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
    protected abstract type: string; //not in the contribution configuration, just to be shown in the UI as "Type"
    contributorName: string;
    contributorLastName: string;
    contributorEmail: string;
    contributorOrganization: string;
    baseURI: IRI;
}
export class StableResourceStoredContribution extends StoredContribution {
    type = "Stable";
    resourceName: string;
    homepage: string;
    description: string;
    isOwner: boolean;
    model: IRI;
    lexicalizationModel: IRI
}
export class MetadataStoredContribution extends StoredContribution {
    type = "Metadata";
    resourceName: string;
}
export class DevResourceStoredContribution extends StoredContribution {
    type = "Development";
    format: string;
	resourceName: string;
	homepage: string;
	description: string;
	model: IRI;
	lexicalizationModel: IRI;
}