export enum ResViewPartition {
    broaders = "broaders",
    classaxioms = "classaxioms",
    constituents = "constituents",
    denotations = "denotations",
    disjointProperties = "disjointProperties",
    domains = "domains",
    equivalentProperties = "equivalentProperties",
    evokedLexicalConcepts = "evokedLexicalConcepts",
    facets = "facets",
    formBasedPreview = "formBasedPreview",
    formRepresentations = "formRepresentations",
    imports = "imports",
    labelRelations = "labelRelations",
    lexicalizations = "lexicalizations",
    lexicalForms = "lexicalForms",
    lexicalSenses = "lexicalSenses",
    members = "members",
    membersOrdered = "membersOrdered",
    notes = "notes",
    properties = "properties",
    ranges = "ranges",
    rdfsMembers = "rdfsMembers",
    schemes = "schemes",
    subPropertyChains = "subPropertyChains",
    subterms = "subterms",
    superproperties = "superproperties",
    topconceptof = "topconceptof",
    types = "types"
}

export class ResViewUtils {

    public static orderedResourceViewPartitions: ResViewPartition[] = [
        ResViewPartition.types,
        ResViewPartition.classaxioms,
        ResViewPartition.topconceptof,
        ResViewPartition.schemes,
        ResViewPartition.broaders,
        ResViewPartition.superproperties,
        ResViewPartition.equivalentProperties,
        ResViewPartition.disjointProperties,
        ResViewPartition.subPropertyChains,
        ResViewPartition.subterms,
        ResViewPartition.domains,
        ResViewPartition.ranges,
        ResViewPartition.facets,
        ResViewPartition.lexicalizations,
        ResViewPartition.lexicalForms,
        ResViewPartition.lexicalSenses,
        ResViewPartition.denotations,
        ResViewPartition.evokedLexicalConcepts,
        ResViewPartition.notes,
        ResViewPartition.members,
        ResViewPartition.membersOrdered,
        ResViewPartition.labelRelations,
        ResViewPartition.formRepresentations,
        ResViewPartition.formBasedPreview,
        ResViewPartition.imports,
        ResViewPartition.constituents,
        ResViewPartition.rdfsMembers,
        ResViewPartition.properties
    ]

    public static getResourceViewPartitionLabel(partition: ResViewPartition): string {
        if (partition == ResViewPartition.classaxioms) {
            return "Class axioms";
        } else if (partition == ResViewPartition.disjointProperties) {
            return "Disjoint properties";
        } else if (partition == ResViewPartition.equivalentProperties) {
            return "Equivalent properties";
        } else if (partition == ResViewPartition.evokedLexicalConcepts) {
            return "Evoked Lexical Concepts";
        } else if (partition == ResViewPartition.facets) {
            return "Property facets";
        } else if (partition == ResViewPartition.formBasedPreview) {
            return "Custom Form Preview";
        } else if (partition == ResViewPartition.formRepresentations) {
            return "Form Representations";
        } else if (partition == ResViewPartition.labelRelations) {
            return "Label relations";
        } else if (partition == ResViewPartition.lexicalForms) {
            return "Lexical forms";
        } else if (partition == ResViewPartition.lexicalSenses) {
            return "Lexical senses";
        } else if (partition == ResViewPartition.membersOrdered) {
            return "Members (ordered)";
        } else if (partition == ResViewPartition.properties) {
            return "Other properties";
        } else if (partition == ResViewPartition.rdfsMembers) {
            return "RDFS members";
        } else if (partition == ResViewPartition.subPropertyChains) {
            return "Property chain axioms";
        } else if (partition == ResViewPartition.topconceptof) {
            return "Top Concept of";
        } else {
            return partition.charAt(0).toUpperCase() + partition.slice(1);
        }
    }

}

export class PropertyFacet {
    name: string;
    value: boolean;
    explicit: boolean;
}

export enum PropertyFacetsEnum {
    symmetric = "symmetric",
    asymmetric = "asymmetric",
    functional = "functional",
    inverseFunctional = "inverseFunctional",
    reflexive = "reflexive",
    irreflexive = "irreflexive",
    transitive = "transitive"
}

export enum ResourceViewCtx {
    modal = "modal"
}