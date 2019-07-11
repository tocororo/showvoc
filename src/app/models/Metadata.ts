import { IRI, Literal } from './Resources';

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