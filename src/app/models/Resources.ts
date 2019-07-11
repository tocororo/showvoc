
/**
 * Value, Resource, IRI, BNode and Literal are for the most copied from the RDF4J API.
 * I added some methods for utility.
 */

export abstract class Value {
    abstract stringValue(): string;
    abstract toNT(): string;

    equals(value: Value): boolean {
        return this.toNT() == value.toNT();
    }

    isResource(): boolean {
        return false;
    }
    isIRI(): boolean {
        return false;
    }
    isBNode(): boolean {
        return false;
    }
    isLiteral(): boolean {
        return false;
    }
}

export abstract class Resource extends Value {
    isResource(): boolean {
        return true;
    }
}

export class IRI extends Resource {
    private iriString: string;

    private localNameIdx: number = -1;

    constructor(iriString: string) {
        super();
        this.setIRI(iriString);
    }

    getIRI(): string {
        return this.iriString;
    }
    setIRI(iriString: string) {
        this.iriString = iriString;
    }

    getNamespace(): string {
        if (this.localNameIdx < 0) {
            this.localNameIdx = this.getLocalNameIndex(this.iriString);
        }
        return this.iriString.substring(0, this.localNameIdx);
    }
    getLocalName(): string {
        if (this.localNameIdx < 0) {
            this.localNameIdx = this.getLocalNameIndex(this.iriString);
        }

        return this.iriString.substring(this.localNameIdx);
    }
    private getLocalNameIndex(iri: string): number {
        let separatorIdx = this.iriString.indexOf('#');
        if (separatorIdx < 0) {
            separatorIdx = this.iriString.lastIndexOf('/');
        }
        if (separatorIdx < 0) {
            separatorIdx = this.iriString.lastIndexOf(':');
        }
        return separatorIdx + 1;
    }

    stringValue(): string {
        return this.iriString;
    }

    toNT(): string {
        return "<" + this.iriString + ">";
    }

    isIRI(): boolean {
        return true;
    }

}


export class BNode extends Resource {
    private id: string;

    constructor(id: string) {
        super();
        this.setID(id);;
    }

    getID(): string {
        return this.id;
    }
    setID(id: string) {
        this.id = id;
    }

    stringValue(): string {
        return this.id;
    }

    toNT() {
        return this.stringValue();
    }

    isBNode(): boolean {
        return true;
    }

}

export class Literal extends Value {
    private label: string;
    private language: string;
    private datatype: IRI;

    constructor(label: string, language?: string, datatype?: IRI) {
        super();
        this.setLabel(label);
        this.setLanguage(language);
        this.setDatatype(datatype);
    }

    getLabel(): string {
        return this.label;
    }
    setLabel(label: string) {
        this.label = label;
    }
    getLanguage(): string {
        return this.language;
    }
    setLanguage(language: string) {
        this.language = language;
    }
    getDatatype(): IRI {
        return this.datatype
    }
    setDatatype(datatype: IRI) {
        this.datatype = datatype;
    }

    isLanguageLiteral(): boolean {
        return this.language != null;
    }

    isTypedLiteral(): boolean {
        return this.datatype != null;
    }

    stringValue(): string {
        return this.label;
    }

    toNT() {
        let str: string = '"' + this.label + '"';
        if (this.isLanguageLiteral()) {
            str += '@' + this.language;
        } else if (this.isTypedLiteral()) {
            str += "^^" + this.datatype.toNT();
        }
        return str;
    }

    isLiteral(): boolean {
        return true;
    }
}


export class AnnotatedValue<T extends Value> {
    private value: T;
    private attributes: { [key: string]: any };

    constructor(value: T, attributes?: { [key: string]: any }) {
        this.value = value;
        this.attributes = attributes ? attributes : {};
    }

    getValue(): T {
        return this.value;
    }

    getAttributes(): { [key: string]: any } {
        return this.attributes;
    }
    getAttribute(name: string): any {
        return this.attributes[name];
    }
    setAttribute(name: string, value: any) {
        this.attributes[name] = value;
    }
    deleteAttribute(name: string) {
        delete this.attributes[name];
    }

    getShow(): string {
        let show: string;
        if (this.value instanceof Resource) {
            show = this.getAttribute(ResAttribute.SHOW);
            if (show == null) {
                show = this.value.stringValue();
            }
        } else if (this.value instanceof Literal) {
            show = this.value.getLabel();
        }
        return show;
    }

    /**
     * Returns the role of the described resource. If the annotated value is a literal, return null
     */
    getRole(): RDFResourceRolesEnum {
        if (this.value instanceof Resource) {
            return this.attributes[ResAttribute.ROLE];
        }
    }

    /**
     * Returns the graph where the annotated resource is defined (collected from the nature).
     */
    getResourceGraphs(): IRI[] {
        let resGraphs: IRI[] = []
        if (this.value instanceof Resource) {
            let nature: ResourceNature[] = this.attributes[ResAttribute.NATURE];
            if (nature != null) {
                //iterate over the natures and collect the graph without duplicates
                nature.forEach(n => {
                    n.graphs.forEach(ng => {
                        if (!resGraphs.some(rg => rg.equals(ng))) {
                            resGraphs.push(ng);
                        }
                    });
                });
            }
        }
        return resGraphs;
    }

    getTripleGraphs(): IRI[] {
        let tripleGraphs: IRI[] = this.attributes[ResAttribute.GRAPHS];
        if (tripleGraphs == null) {
            tripleGraphs = [];
        }
        return tripleGraphs;
    }

    /**
     * Adds a nature (pair role-graph) to the annotated value
     * @param role 
     * @param graph 
     */
    addNature(role: RDFResourceRolesEnum, graph: IRI) {
        if (this.value instanceof Resource) {
            let resNature: ResourceNature[] = this.attributes[ResAttribute.NATURE];
            if (resNature == null) {
                resNature = [];
            }
            let n = resNature.find(n => n.role == role);
            if (n != null) {
                n.graphs.push(graph);
            } else {
                resNature.push({ role: role, graphs: [graph] });
            }
            this.attributes[ResAttribute.NATURE] = resNature;
        }
    }

    getNature(): ResourceNature[] {
        let nature: ResourceNature[] = this.attributes[ResAttribute.NATURE];
        if (nature == null) {
            nature = [];
        }
        return nature;
    }

    isDeprecated(): boolean {
        return this.attributes[ResAttribute.DEPRECATED];
    }
}

export class PredicateObjects {
    private predicate: AnnotatedValue<IRI>;
    private objects: AnnotatedValue<Value>[];

    constructor(predicate: AnnotatedValue<IRI>, objects: AnnotatedValue<Value>[]) {
        this.predicate = predicate;
        this.objects = objects;
    }

    getPredicate(): AnnotatedValue<IRI> {
        return this.predicate;
    };

    getObjects(): AnnotatedValue<Value>[] {
        return this.objects;
    };
}

export class ResAttribute {
    public static SHOW = "show";
    public static QNAME = "qname";
    public static ROLE = "role";
    public static EXPLICIT = "explicit";
    public static MORE = "more";
    public static NUM_INST = "numInst";
    public static HAS_CUSTOM_RANGE = "hasCustomRange";
    public static RESOURCE_POSITION = "resourcePosition";
    public static ACCESS_METHOD = "accessMethod";
    public static LANG = "lang";
    public static GRAPHS = "graphs"; //used for the objects in getResourceView response
    public static MEMBERS = "members"; //used for ordered collections
    public static INDEX = "index"; //used for members of ordered collections
    public static IN_SCHEME = "inScheme"; //used only in Skos.getSchemesMatrixPerConcept()
    public static NATURE = "nature"; //content is a triple separated by "-": <uri of class of resource> - <graph of ???> - <deprecated true/false>
    public static SCHEMES = "schemes"; //attribute of concepts in searchResource response
    public static TRIPLE_SCOPE = "tripleScope"; //used in the object in getResourceView

    //never in st responses, result of nature parsing
    public static DEPRECATED = "deprecated";

    //never in st responses, added because are useful for tree
    public static SELECTED = "selected"; //if true, render the node as selected
    public static NEW = "new"; //if true, the resource is made visible after the treeNodeComponent is initialized

    //useful in ResourceView to render potentially reified resource as not reified
    public static NOT_REIFIED = "notReified";//
}

export enum RDFResourceRolesEnum {
    annotationProperty = "annotationProperty",
    cls = "cls",
    concept = "concept",
    conceptScheme = "conceptScheme",
    dataRange = "dataRange",
    datatypeProperty = "datatypeProperty",
    individual = "individual",
    mention = "mention",
    objectProperty = "objectProperty",
    ontology = "ontology",
    ontologyProperty = "ontologyProperty",
    property = "property",
    undetermined = "undetermined",
    xLabel = "xLabel",
    skosCollection = "skosCollection",
    skosOrderedCollection = "skosOrderedCollection",
    limeLexicon = "limeLexicon",
    ontolexLexicalEntry = "ontolexLexicalEntry",
    ontolexLexicalSense = "ontolexLexicalSense",
    ontolexForm = "ontolexForm"
}

export enum RDFTypesEnum {
    bnode = "bnode",
    literal = "literal",
    plainLiteral = "plainLiteral",
    resource = "resource",
    typedLiteral = "typedLiteral",
    undetermined = "undetermined",
    uri = "uri"
}

export abstract class ResourcePosition {
    position: ResourcePositionEnum;

    isLocal(): boolean {
        return false;
    }
    isRemote(): boolean {
        return false;
    }
    isUnknown(): boolean {
        return false;
    }

    abstract serialize(): string;

    static deserialize(resPositionJson: string): ResourcePosition {
        if (resPositionJson.startsWith(ResourcePositionEnum.local)) {
            return new LocalResourcePosition(resPositionJson.substring(resPositionJson.indexOf(":") + 1));
        } else if (resPositionJson.startsWith(ResourcePositionEnum.remote)) {
            return new RemoteResourcePosition(resPositionJson.substring(resPositionJson.indexOf(":") + 1));
        } else { //if (resPositionJson.startsWith(ResourcePositionEnum.unknown)) {
            return new UnknownResourcePosition();
        }
    }
}
export class LocalResourcePosition extends ResourcePosition {
    project: string;
    constructor(project: string) {
        super();
        this.position = ResourcePositionEnum.local;
        this.project = project;
    }
    isLocal(): boolean {
        return true;
    }
    serialize(): string {
        return this.position + ":" + this.project;
    }
}
export class RemoteResourcePosition extends ResourcePosition {
    datasetMetadata: IRI;
    constructor(datasetMetadata: string) {
        super();
        this.position = ResourcePositionEnum.remote;
        this.datasetMetadata = new IRI(datasetMetadata);
    }
    isRemote(): boolean {
        return true;
    }
    serialize(): string {
        return this.position + ":" + this.datasetMetadata.getIRI();
    }
}
export class UnknownResourcePosition extends ResourcePosition {
    constructor() {
        super();
        this.position = ResourcePositionEnum.unknown;
    }
    isUnknown(): boolean {
        return true;
    }
    serialize(): string {
        return this.position + ":";
    }
}
export enum ResourcePositionEnum {
    local = "local",
    remote = "remote",
    unknown = "unknown"
}
export enum TripleScopes {
    local = "local",
    staged = "staged",
    del_staged = "del_staged",
    imported = "imported",
    inferred = "inferred"
}

export class ResourceNature {
    role: RDFResourceRolesEnum;
    graphs: IRI[];
}

export class Triple<T extends Value> {
    private left: T;
    private middle: T;
    private right: T;

    constructor(left: T, middle: T, right: T) {
        this.left = left;
        this.middle = middle;
        this.right = right;
    }

    getLeft(): T {
        return this.left;
    }
    getMiddle(): T {
        return this.middle;
    }
    getRight(): T {
        return this.right;
    }

}