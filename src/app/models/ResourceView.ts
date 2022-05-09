export enum ResViewPartition {
    broaders = "broaders",
    classaxioms = "classaxioms",
    constituents = "constituents",
    datatypeDefinitions = "datatypeDefinitions",
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
    ];

    public static getResourceViewPartitionLabelTranslationKey(partition: ResViewPartition): string {
        switch (partition) {
        case ResViewPartition.broaders:
            return "RESOURCE_VIEW.PARTITIONS.BROADERS";
        case ResViewPartition.classaxioms:
            return "RESOURCE_VIEW.PARTITIONS.CLASS_AXIOMS";
        case ResViewPartition.constituents:
            return "RESOURCE_VIEW.PARTITIONS.CONSTRITUENST";
        case ResViewPartition.datatypeDefinitions:
            return "RESOURCE_VIEW.PARTITIONS.DATATYPE_DEFINITIONS";
        case ResViewPartition.denotations:
            return "RESOURCE_VIEW.PARTITIONS.DENOTATIONS";
        case ResViewPartition.disjointProperties:
            return "RESOURCE_VIEW.PARTITIONS.DISJOINT_PROPERTIES";
        case ResViewPartition.domains:
            return "RESOURCE_VIEW.PARTITIONS.DOMAINS";
        case ResViewPartition.equivalentProperties:
            return "RESOURCE_VIEW.PARTITIONS.EQUIVALENT_PROPERTIES";
        case ResViewPartition.evokedLexicalConcepts:
            return "RESOURCE_VIEW.PARTITIONS.EVOKED_LEXICAL_CONCEPTS";
        case ResViewPartition.facets:
            return "RESOURCE_VIEW.PARTITIONS.FACETS";
        case ResViewPartition.formBasedPreview:
            return "RESOURCE_VIEW.PARTITIONS.FORM_BASED_PREVIEW";
        case ResViewPartition.formRepresentations:
            return "RESOURCE_VIEW.PARTITIONS.FORM_PRESENTATIONS";
        case ResViewPartition.imports:
            return "RESOURCE_VIEW.PARTITIONS.IMPORTS";
        case ResViewPartition.labelRelations:
            return "RESOURCE_VIEW.PARTITIONS.LABEL_RELATIONS";
        case ResViewPartition.lexicalForms:
            return "RESOURCE_VIEW.PARTITIONS.LEXICAL_FORMS";
        case ResViewPartition.lexicalSenses:
            return "RESOURCE_VIEW.PARTITIONS.LEXICAL_SENSES";
        case ResViewPartition.lexicalizations:
            return "RESOURCE_VIEW.PARTITIONS.LEXICALIZATIONS";
        case ResViewPartition.members:
            return "RESOURCE_VIEW.PARTITIONS.MEMBERS";
        case ResViewPartition.membersOrdered:
            return "RESOURCE_VIEW.PARTITIONS.MEMBERS_ORDERED";
        case ResViewPartition.notes:
            return "RESOURCE_VIEW.PARTITIONS.NOTES";
        case ResViewPartition.properties:
            return "RESOURCE_VIEW.PARTITIONS.PROPERTIES";
        case ResViewPartition.ranges:
            return "RESOURCE_VIEW.PARTITIONS.RANGES";
        case ResViewPartition.rdfsMembers:
            return "RESOURCE_VIEW.PARTITIONS.RDFS_MEMBERS";
        case ResViewPartition.schemes:
            return "RESOURCE_VIEW.PARTITIONS.SCHEMES";
        case ResViewPartition.subPropertyChains:
            return "RESOURCE_VIEW.PARTITIONS.SUBPROPERTY_CHAINS";
        case ResViewPartition.subterms:
            return "RESOURCE_VIEW.PARTITIONS.SUBTERMS";
        case ResViewPartition.superproperties:
            return "RESOURCE_VIEW.PARTITIONS.SUPERPROPERTIES";
        case ResViewPartition.topconceptof:
            return "RESOURCE_VIEW.PARTITIONS.TOP_CONCEPT_OF";
        case ResViewPartition.types:
            return "RESOURCE_VIEW.PARTITIONS.TYPES";
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