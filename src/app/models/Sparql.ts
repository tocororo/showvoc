export enum ResultType {
    graph = "graph",
    tuple = "tuple",
    boolean = "boolean"
}

export enum QueryMode {
    query = "query",
    update = "update"
}

export class QueryChangedEvent {
    query: string;
    valid: boolean;
    mode: QueryMode;
}

export class GraphResultBindings {
    subj: QueryResultBinding;
    pred: QueryResultBinding;
    obj: QueryResultBinding;
}

export class QueryResultBinding {
    type: "uri" | "literal" | "bnode";
    value: string;
    datatype?: string;
    'xml:lang': string;
}