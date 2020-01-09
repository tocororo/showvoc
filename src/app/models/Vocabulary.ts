import { IRI } from "./Resources";

export class RDF {
    public static uri = "http://www.w3.org/1999/02/22-rdf-syntax-ns";
    public static namespace = RDF.uri + "#";
    public static prefix = "rdf";
    // CLASSES
    public static alt = new IRI(RDF.namespace + "Alt");
    public static bag = new IRI(RDF.namespace + "Bag");
    public static langString = new IRI(RDF.namespace + "langString");
    public static list = new IRI(RDF.namespace + "List");
    public static property = new IRI(RDF.namespace + "Property");
    public static seq = new IRI(RDF.namespace + "Seq");
    public static statement = new IRI(RDF.namespace + "Statement");
    public static xmlLiteral = new IRI(RDF.namespace + "XMLLiteral");
    //PROPERTIES
    public static first = new IRI(RDF.namespace + "first");
    public static object = new IRI(RDF.namespace + "object");
    public static predicate = new IRI(RDF.namespace + "predicate");
    public static rest = new IRI(RDF.namespace + "rest");
    public static subject = new IRI(RDF.namespace + "subject");
    public static type = new IRI(RDF.namespace + "type");
    public static value = new IRI(RDF.namespace + "value");
    //INDIVIDUALS
    public static nil = new IRI(RDF.namespace + "nil");
}

export class RDFS {
    public static uri = "http://www.w3.org/2000/01/rdf-schema";
    public static namespace = RDFS.uri + "#";
    public static prefix = "rdfs";
    //CLASSES
    public static class = new IRI(RDFS.namespace + "Class");
    public static container = new IRI(RDFS.namespace + "Container");
    public static containerMembershipProperty = new IRI(RDFS.namespace + "ContainerMembershipProperty");
    public static datatype = new IRI(RDFS.namespace + "Datatype");
    public static literal = new IRI(RDFS.namespace + "Literal");
    public static resource = new IRI(RDFS.namespace + "Resource");
    //PROPERTIES
    public static comment = new IRI(RDFS.namespace + "comment");
    public static domain = new IRI(RDFS.namespace + "domain");
    public static isDefinedBy = new IRI(RDFS.namespace + "isDefinedBy");
    public static label = new IRI(RDFS.namespace + "label");
    public static member = new IRI(RDFS.namespace + "member");
    public static range = new IRI(RDFS.namespace + "range");
    public static seeAlso = new IRI(RDFS.namespace + "seeAlso");
    public static subClassOf = new IRI(RDFS.namespace + "subClassOf");
    public static subPropertyOf = new IRI(RDFS.namespace + "subPropertyOf");
}

export class OWL {
    public static uri = "http://www.w3.org/2002/07/owl";
    public static namespace = OWL.uri + "#";
    public static prefix = "owl";

    //CLASSES
    public static allDifferent = new IRI(OWL.namespace + "AllDifferent");
    public static allDisjointClasses = new IRI(OWL.namespace + "AllDisjointClasses");
    public static allDisjointProperties = new IRI(OWL.namespace + "AllDisjointProperties");
    public static annotation = new IRI(OWL.namespace + "Annotation");
    public static annotationProperty = new IRI(OWL.namespace + "AnnotationProperty");
    public static asymmetricProperty = new IRI(OWL.namespace + "AsymmetricProperty");
    public static axiom = new IRI(OWL.namespace + "Axiom");
    public static class = new IRI(OWL.namespace + "Class");
    public static dataRange = new IRI(OWL.namespace + "DataRange");
    public static datatypeProperty = new IRI(OWL.namespace + "DatatypeProperty");
    public static deprecatedClass = new IRI(OWL.namespace + "DeprecatedClass");
    public static deprecatedProperty = new IRI(OWL.namespace + "DeprecatedProperty");
    public static functionalProperty = new IRI(OWL.namespace + "FunctionalProperty");
    public static inverseFunctionalProperty = new IRI(OWL.namespace + "InverseFunctionalProperty");
    public static irreflexiveProperty = new IRI(OWL.namespace + "IrreflexiveProperty");
    public static negativePropertyAssertion = new IRI(OWL.namespace + "NegativePropertyAssertion");
    public static namedIndividual = new IRI(OWL.namespace + "NamedIndividual");
    public static nothing = new IRI(OWL.namespace + "Nothing");
    public static objectProperty = new IRI(OWL.namespace + "ObjectProperty");
    public static ontology = new IRI(OWL.namespace + "Ontology");
    public static ontologyProperty = new IRI(OWL.namespace + "OntologyProperty");
    public static reflexiveProperty = new IRI(OWL.namespace + "ReflexiveProperty");
    public static restriction = new IRI(OWL.namespace + "Restriction");
    public static symmetricProperty = new IRI(OWL.namespace + "SymmetricProperty");
    public static thing = new IRI(OWL.namespace + "Thing");
    public static transitiveProperty = new IRI(OWL.namespace + "TransitiveProperty");
    //PROPERTIES
    public static allValuesFrom = new IRI(OWL.namespace + "allValuesFrom");
    public static backwardCompatibleWith = new IRI(OWL.namespace + "backwardCompatibleWith");
    public static cardinality = new IRI(OWL.namespace + "cardinality");
    public static complementOf = new IRI(OWL.namespace + "complementOf");
    public static differentFrom = new IRI(OWL.namespace + "differentFrom");
    public static disjointWith = new IRI(OWL.namespace + "disjointWith");
    public static distinctMembers = new IRI(OWL.namespace + "distinctMembers");
    public static equivalentClass = new IRI(OWL.namespace + "equivalentClass");
    public static equivalentProperty = new IRI(OWL.namespace + "equivalentProperty");
    public static hasValue = new IRI(OWL.namespace + "hasValue");
    public static imports = new IRI(OWL.namespace + "imports");
    public static incompatibleWith = new IRI(OWL.namespace + "incompatibleWith");
    public static intersectionOf = new IRI(OWL.namespace + "intersectionOf");
    public static inverseOf = new IRI(OWL.namespace + "inverseOf");
    public static maxCardinality = new IRI(OWL.namespace + "maxCardinality");
    public static minCardinality = new IRI(OWL.namespace + "minCardinality");
    public static oneOf = new IRI(OWL.namespace + "oneOf");
    public static onProperty = new IRI(OWL.namespace + "onProperty");
    public static priorVersion = new IRI(OWL.namespace + "priorVersion");
    public static propertyChainAxiom = new IRI(OWL.namespace + "propertyChainAxiom");
    public static propertyDisjointWith = new IRI(OWL.namespace + "propertyDisjointWith");
    public static sameAs = new IRI(OWL.namespace + "sameAs");
    public static someValuesFrom = new IRI(OWL.namespace + "someValuesFrom");
    public static unionOf = new IRI(OWL.namespace + "unionOf");
    public static versionInfo = new IRI(OWL.namespace + "versionInfo");
    //DATATYPES
    public static rational = new IRI(OWL.namespace + "rational");
    public static real = new IRI(OWL.namespace + "real");
}

export class SKOS {
    public static uri = "http://www.w3.org/2004/02/skos/core";
    public static namespace = SKOS.uri + "#";
    public static prefix = "skos";
    //CLASSES
    public static collection = new IRI(SKOS.namespace + "Collection");
    public static concept = new IRI(SKOS.namespace + "Concept");
    public static conceptScheme = new IRI(SKOS.namespace + "ConceptScheme");
    public static orderedCollection = new IRI(SKOS.namespace + "OrderedCollection");
    //PROPERTIES
    public static altLabel = new IRI(SKOS.namespace + "altLabel");
    public static broadMatch = new IRI(SKOS.namespace + "broadMatch");
    public static broader = new IRI(SKOS.namespace + "broader");
    public static broaderTransitive = new IRI(SKOS.namespace + "broaderTransitive");
    public static changeNote = new IRI(SKOS.namespace + "changeNote");
    public static closeMatch = new IRI(SKOS.namespace + "closeMatch");
    public static definition = new IRI(SKOS.namespace + "definition");
    public static editorialNote = new IRI(SKOS.namespace + "editorialNote");
    public static exactMatch = new IRI(SKOS.namespace + "exactMatch");
    public static example = new IRI(SKOS.namespace + "example");
    public static hasTopConcept = new IRI(SKOS.namespace + "hasTopConcept");
    public static hiddenLabel = new IRI(SKOS.namespace + "hiddenLabel");
    public static historyNote = new IRI(SKOS.namespace + "historyNote");
    public static inScheme = new IRI(SKOS.namespace + "inScheme");
    public static mappingRelation = new IRI(SKOS.namespace + "mappingRelation");
    public static member = new IRI(SKOS.namespace + "member");
    public static memberList = new IRI(SKOS.namespace + "memberList");
    public static narrowMatch = new IRI(SKOS.namespace + "narrowMatch");
    public static narrower = new IRI(SKOS.namespace + "narrower");
    public static narrowerTransitive = new IRI(SKOS.namespace + "narrowerTransitive");
    public static notation = new IRI(SKOS.namespace + "notation");
    public static note = new IRI(SKOS.namespace + "note");
    public static prefLabel = new IRI(SKOS.namespace + "prefLabel");
    public static related = new IRI(SKOS.namespace + "related");
    public static relatedMatch = new IRI(SKOS.namespace + "relatedMatch");
    public static scopeNote = new IRI(SKOS.namespace + "scopeNote");
    public static semanticRelation = new IRI(SKOS.namespace + "semanticRelation");
    public static topConceptOf = new IRI(SKOS.namespace + "topConceptOf");
}

export class SKOSXL {
    public static uri = "http://www.w3.org/2008/05/skos-xl";
    public static namespace = SKOSXL.uri + "#";
    public static prefix = "skosxl";
    //CLASSES
    public static label = new IRI(SKOSXL.namespace + "Label");
    //PROPERTIES
    public static altLabel = new IRI(SKOSXL.namespace + "altLabel");
    public static hiddenLabel = new IRI(SKOSXL.namespace + "hiddenLabel");
    public static labelRelation = new IRI(SKOSXL.namespace + "labelRelation");
    public static literalForm = new IRI(SKOSXL.namespace + "literalForm");
    public static prefLabel = new IRI(SKOSXL.namespace + "prefLabel");
}

export class XmlSchema { //all resources here have role "individual" (don't know if it's ok)
    public static uri = "http://www.w3.org/2001/XMLSchema";
    public static namespace = XmlSchema.uri + "#";
    public static prefix = "xsd";

    public static anyURI = new IRI(XmlSchema.namespace + "anyURI");
    public static base64Binary = new IRI(XmlSchema.namespace + "base64Binary");
    public static boolean = new IRI(XmlSchema.namespace + "boolean");
    public static date = new IRI(XmlSchema.namespace + "date");
    public static dateTime = new IRI(XmlSchema.namespace + "dateTime");
    public static dateTimeStamp = new IRI(XmlSchema.namespace + "dateTimeStamp");
    public static decimal = new IRI(XmlSchema.namespace + "decimal");
    public static double = new IRI(XmlSchema.namespace + "double");
    public static duration = new IRI(XmlSchema.namespace + "duration");
    public static float = new IRI(XmlSchema.namespace + "float");
    public static gDay = new IRI(XmlSchema.namespace + "gDay");
    public static gMonth = new IRI(XmlSchema.namespace + "gMonth");
    public static gMonthDay = new IRI(XmlSchema.namespace + "gMonthDay");
    public static gYear = new IRI(XmlSchema.namespace + "gYear");
    public static gYearMonth = new IRI(XmlSchema.namespace + "gYearMonth");
    public static hexBinary = new IRI(XmlSchema.namespace + "hexBinary");
    public static NOTATION = new IRI(XmlSchema.namespace + "NOTATION");
    public static QName = new IRI(XmlSchema.namespace + "QName");
    public static string = new IRI(XmlSchema.namespace + "string");
    public static time = new IRI(XmlSchema.namespace + "time");
    //Derived datatypes
    public static byte = new IRI(XmlSchema.namespace + "byte");
    public static ENTITIES = new IRI(XmlSchema.namespace + "ENTITIES");
    public static ENTITY = new IRI(XmlSchema.namespace + "ENTITY");
    public static ID = new IRI(XmlSchema.namespace + "ID");
    public static IDREF = new IRI(XmlSchema.namespace + "IDREF");
    public static IDREFS = new IRI(XmlSchema.namespace + "IDREFS");
    public static int = new IRI(XmlSchema.namespace + "int");
    public static integer = new IRI(XmlSchema.namespace + "integer");
    public static language = new IRI(XmlSchema.namespace + "language");
    public static long = new IRI(XmlSchema.namespace + "long");
    public static Name = new IRI(XmlSchema.namespace + "Name");
    public static NCName = new IRI(XmlSchema.namespace + "NCName");
    public static negativeInteger = new IRI(XmlSchema.namespace + "negativeInteger");
    public static NMTOKEN = new IRI(XmlSchema.namespace + "NMTOKEN");
    public static NMTOKENS = new IRI(XmlSchema.namespace + "NMTOKENS");
    public static nonNegativeInteger = new IRI(XmlSchema.namespace + "nonNegativeInteger");
    public static nonPositiveInteger = new IRI(XmlSchema.namespace + "nonPositiveInteger");
    public static normalizedString = new IRI(XmlSchema.namespace + "normalizedString");
    public static positiveInteger = new IRI(XmlSchema.namespace + "positiveInteger");
    public static short = new IRI(XmlSchema.namespace + "short");
    public static token = new IRI(XmlSchema.namespace + "token");
    public static unsignedByte = new IRI(XmlSchema.namespace + "unsignedByte");
    public static unsignedInt = new IRI(XmlSchema.namespace + "unsignedInt");
    public static unsignedLong = new IRI(XmlSchema.namespace + "unsignedLong");
    public static unsignedShort = new IRI(XmlSchema.namespace + "unsignedShort");
}


export class DCT {
    public static uri = "http://purl.org/dc/terms";
    public static namespace = DCT.uri + "/";
    public static prefix = "dct";
    //PROPERTIES
    public static created = new IRI(DCT.namespace + "created");
    public static modified = new IRI(DCT.namespace + "modified");
}

export class OntoLex {
    public static uri = "http://www.w3.org/ns/lemon/ontolex";
    public static namespace = OntoLex.uri + "#";
    public static prefix = "ontolex";
    //CLASSES
    public static conceptSet = new IRI(OntoLex.namespace + "ConceptSet");
    public static form = new IRI(OntoLex.namespace + "Form");
    public static lexicalConcept = new IRI(OntoLex.namespace + "LexicalConcept");
    public static lexicalEntry = new IRI(OntoLex.namespace + "LexicalEntry");
    public static lexicalSense = new IRI(OntoLex.namespace + "LexicalSense");
    //PROPERTIES
    public static canonicalForm = new IRI(OntoLex.namespace + "canonicalForm");
    public static denotes = new IRI(OntoLex.namespace + "denotes");
    public static evokes = new IRI(OntoLex.namespace + "evokes");
    public static isDenotedBy = new IRI(OntoLex.namespace + "isDenotedBy");
    public static lexicalForm = new IRI(OntoLex.namespace + "lexicalForm");
    public static otherForm = new IRI(OntoLex.namespace + "otherForm");

    public static representation = new IRI(OntoLex.namespace + "representation");

    public static sense = new IRI(OntoLex.namespace + "sense");
}

export class Lime {
    public static uri = "http://www.w3.org/ns/lemon/lime";
    public static namespace = Lime.uri + "#";
    public static prefix = "lime";

    public static lexicon = new IRI(Lime.namespace + "Lexicon");
}

export class Decomp {
    public static uri = "http://www.w3.org/ns/lemon/decomp";
    public static namespace = Decomp.uri + "#";
    public static prefix = "decomp";

    public static component = new IRI(Decomp.namespace + "Component");
    public static constituent = new IRI(Decomp.namespace + "constituent");
    public static subterm = new IRI(Decomp.namespace + "subterm");
}

export class SemanticTurkey {
    public static stagingAddGraph = "http://semanticturkey.uniroma2.it/ns/validation#staging-add-graph/";
    public static stagingRemoveGraph = "http://semanticturkey.uniroma2.it/ns/validation#staging-remove-graph/";
    public static inferenceGraph = "http://semanticturkey/inference-graph";

    public static standardDereferenciation = "http://semanticturkey.uniroma2.it/ns/mdreg#standardDereferenciation";
    public static noDereferenciation = "http://semanticturkey.uniroma2.it/ns/mdreg#noDereferenciation";

    public static noAggregation = "http://semanticturkey.uniroma2.it/ns/mdreg#noAggregation";
}