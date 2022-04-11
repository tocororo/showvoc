import { SearchMode } from './Properties';
import { Literal, IRI, RDFResourceRolesEnum } from './Resources';

export class GlobalSearchResult {
    resource: IRI;
    resourceLocalName: string;
    resourceType: IRI;
    role: RDFResourceRolesEnum;
    repository: {
        id: string;
        open: boolean;
    };
    details: SearchResultDetails[];
    show?: string; //not in the response, computed later for each result
}
export class SearchResultDetails {
    matchedValue: Literal;
    predicate: IRI;
    type: "note" | "label";
}

export class TripleForSearch { 
    predicate: IRI;
    searchString: string;
    mode: SearchMode;
}