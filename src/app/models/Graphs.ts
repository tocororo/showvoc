import { IRI, AnnotatedValue } from './Resources';

export class GraphModelRecord {
    source: AnnotatedValue<IRI>;
    link: AnnotatedValue<IRI>;
    target: AnnotatedValue<IRI>;
    classAxiom: boolean;
}

export class GraphClassAxiomFilter {
    property: IRI;
    show: boolean;
}