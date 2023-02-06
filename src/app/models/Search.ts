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

export class TranslationResult {
    resource: string;
    resourceLocalName: string;
    resourceType: string;
    role: RDFResourceRolesEnum;
    repository: {
        id: string;
        open: boolean;
    };
    matches: TranslationDetail[];
    descriptions: TranslationDetail[];
    translations: TranslationDetail[];
}

export class TranslationDetail {
    lang: string;
    values: TranslationValue[];
}

export class TranslationValue {
    value: string;
    predicate: string;
    type: "lexicalization" | "note";
}