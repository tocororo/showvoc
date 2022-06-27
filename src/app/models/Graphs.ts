import { AnnotatedValue, IRI, Resource } from './Resources';

export class GraphModelRecord {
    source: AnnotatedValue<Resource>;
    link: AnnotatedValue<IRI>;
    target: AnnotatedValue<Resource>;
    classAxiom: boolean;
}

export class GraphClassAxiomFilter {
    property: AnnotatedValue<IRI>;
    show: boolean;
}