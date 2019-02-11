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
}

export abstract class Resource extends Value {
    isResource(): boolean { return true; }
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

    toString(): string {
        return this.stringValue();
    }

    toNT(): string {
        return "<" + this.iriString + ">";
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

    toString(): string {
        return "_:" + this.id;
    }

    toNT() {
        return this.toString();
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

    toString(): string {
        let str: string = '"' + this.label + '"';
        if (this.isLanguageLiteral()) {
            str += '@' + this.language;
		} else if (this.isTypedLiteral()) {
			str += "^^<" + this.datatype.toString() + ">";
        }
        return str;
    }

    toNT() {
        return this.toString();
    }
}


export class AnnotatedValue<T extends Value> {
    private value: T;
    private attributes: { [key: string]: any } = {};

    constructor(value: T) {
        this.value = value;
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
}

export class ResourceUtils {

    // /**
    //  * Sort an Array of Resource by the given attribute.
    //  * @param list 
    //  * @param attribute
    //  */
    // static sortResources(list: Value[], attribute: SortAttribute) {
    //     //sort by show
    //     if (attribute == SortAttribute.show) {
    //         list.sort(
    //             function (r1: ARTNode, r2: ARTNode) {
    //                 return r1.getShow().toLowerCase().localeCompare(r2.getShow().toLowerCase());
    //             }
    //         );
    //     }
    //     if (attribute == SortAttribute.value) {
    //         list.sort(
    //             function (r1: ARTNode, r2: ARTNode) {
    //                 return r1.getNominalValue().localeCompare(r2.getNominalValue());
    //             }
    //         );
    //     }
    // }

    // /**
    //  * Tells if a list contains a given node
    //  */
    // static containsNode(list: ARTNode[], node: ARTNode): boolean {
    //     return this.indexOfNode(list, node) != -1;
    // }

    // static indexOfNode(list: ARTNode[], node: ARTNode): number {
    //     for (var i = 0; i < list.length; i++) {
    //         if (list[i].getNominalValue() == node.getNominalValue()) {
    //             return i;
    //         }
    //     }
    //     return -1;
    // }

    /**
     * Returns the rendering of a resource.
     * If rendering is true, returns the show of the resource.
     * If rendering is false, if the resource is a URI resource, reuturns its qname (if not available, the whole uri), if the
     * resource isn't a URI resource, returns the show.
     * @param resource 
     * @param rendering 
     */
    static getRendering(resource: AnnotatedValue<Value>, rendering: boolean) {
        if (rendering) {
            return resource.getShow();
        } else {
            if (resource.getValue() instanceof IRI) {
                let qname = resource.getAttribute(ResAttribute.QNAME);
                if (qname != undefined) {
                    return qname;
                } else {
                    return (<IRI>resource.getValue()).getIRI();
                }
            } else {
                return resource.getShow();
            }
        }
    }

    // /**
    //  * 
    //  * @param nTripleNode 
    //  */
    // static parseNode(nTripleNode: string): ARTNode {
    //     let node: ARTNode;
    //     try {
    //         node = ResourceUtils.parseURI(nTripleNode);
    //     } catch (err) {}
    //     if (node == null) {
    //         try {
    //             node = ResourceUtils.parseLiteral(nTripleNode);
    //         } catch (err) {}
    //     }
    //     if (node == null) {
    //         try {
    //             node = ResourceUtils.parseBNode(nTripleNode);
    //         } catch (err) {}
    //     }
    //     if (node == null) {
    //         throw new Error("Not a legal N-Triples representation: " + nTripleNode);
    //     }
    //     return node;
    // }

    // /**
    //  * Given an NT serialization of a URI, creates and returns an ARTURIResource object.
    //  * Code inspired by org.eclipse.rdf4j.rio.ntriples.NTripleUtils#parseURI()
    //  * @param nTriplesURI 
    //  */
    // static parseURI(nTriplesURI: string): ARTURIResource {
    //     if (nTriplesURI.startsWith("<") && nTriplesURI.endsWith(">")) {
    //         let uri: string = nTriplesURI.substring(1, nTriplesURI.length - 1);
    //         uri = decodeURI(uri);
    //         return new ARTURIResource(uri);
    //     }
    //     else {
    //         throw new Error("Not a legal N-Triples URI: " + nTriplesURI);
    //     }
    // }

    // /**
    //  * Given an NT serialization of a literal, creates and returns an ARTLiteral object.
    //  * Code inspired by org.eclipse.rdf4j.rio.ntriples.NTripleUtils#parseLiteral()
    //  * @param nTriplesLiteral
    //  */
    // static parseLiteral(nTriplesLiteral: string): ARTLiteral {
    //     if (nTriplesLiteral.startsWith("\"")) {
    //         // Find string separation points
    //         let endLabelIdx: number = this.findEndOfLabel(nTriplesLiteral);

    //         if (endLabelIdx != -1) {
    //             let startLangIdx: number = nTriplesLiteral.indexOf("@", endLabelIdx);
    //             let startDtIdx: number = nTriplesLiteral.indexOf("^^", endLabelIdx);

    //             if (startLangIdx != -1 && startDtIdx != -1) {
    //                 throw new Error("Literals can not have both a language and a datatype");
    //             }

    //             // Get label
    //             let label: string = nTriplesLiteral.substring(1, endLabelIdx);
    //             label = label.replace(/\\"/g, '"');

    //             if (startLangIdx != -1) {
    //                 // Get language
    //                 let language: string = nTriplesLiteral.substring(startLangIdx + 1);
    //                 return new ARTLiteral(label, null, language);
    //             }
    //             else if (startDtIdx != -1) {
    //                 // Get datatype
    //                 let datatype: string = nTriplesLiteral.substring(startDtIdx + 2);
    //                 let dtURI: ARTURIResource = this.parseURI(datatype);
    //                 return new ARTLiteral(label, dtURI.getURI());
    //             }
    //             else {
    //                 return new ARTLiteral(label);
    //             }
    //         }
    //     }
    //     throw new Error("Not a legal N-Triples literal: " + nTriplesLiteral);
    // }

    // /**
	//  * Finds the end of the label in a literal string. This method takes into account that characters can be
	//  * escaped using backslashes.
    //  * Code inspired by org.eclipse.rdf4j.rio.ntriples.NTripleUtils#parseLiteral()
    //  * 
	//  * @return The index of the double quote ending the label, or <tt>-1</tt> if it could not be found.
	//  */
    // private static findEndOfLabel(nTriplesLiteral: string): number {
    //     // First character of literal is guaranteed to be a double
    //     // quote, start search at second character.
    //     let previousWasBackslash: boolean = false;
    //     for (var i = 1; i < nTriplesLiteral.length; i++) {
    //         let c: string = nTriplesLiteral.charAt(i);
    //         if (c == '"' && !previousWasBackslash) {
    //             return i;
    //         }
    //         else if (c == '\\' && !previousWasBackslash) {
    //             previousWasBackslash = true; // start of escape
    //         }
    //         else if (previousWasBackslash) {
    //             previousWasBackslash = false; // c was escaped
    //         }
    //     }
    //     return -1;
    // }

    // static parseBNode(nTriplesBNode: string): ARTBNode {
    //     if (nTriplesBNode.startsWith("_:")) {
    //         return new ARTBNode(nTriplesBNode);
    //     } else {
    //         throw new Error("Not a legal N-Triples Blank Node: " + nTriplesBNode);
    //     }
    // }

    // static isQName(nTripleQName: string, prefixMapping: PrefixMapping[]): boolean {
    //     let colonIdx: number = nTripleQName.indexOf(":");
    //     if (colonIdx != -1) {
    //         if (nTripleQName.includes(" ")) { //QName cannot contains whitespace (nTripleQName could represent a manch expr)
    //             return false;
    //         }
    //         let prefix: string = nTripleQName.substring(0, colonIdx);
    //         for (var i = 0; i < prefixMapping.length; i++) {
    //             if (prefixMapping[i].prefix == prefix) {
    //                 return true;
    //             }
    //         }
    //     }
    //     return false;
    // }

    // static parseQName(nTripleQName: string, prefixMapping: PrefixMapping[]): ARTURIResource {
    //     let colonIdx: number = nTripleQName.indexOf(":");
    //     if (colonIdx != -1) {
    //         let prefix: string = nTripleQName.substring(0, colonIdx);
    //         let localName: string = nTripleQName.substring(colonIdx + 1);
    //         //resolve prefix
    //         let namespace: string;
    //         for (var i = 0; i < prefixMapping.length; i++) {
    //             if (prefixMapping[i].prefix == prefix) {
    //                 return new ARTURIResource(prefixMapping[i].namespace + localName);
    //             }
    //         }
    //     } else {
    //         throw new Error("Not a legal N-Triples QName: " + nTripleQName);
    //     }
    // }

    // /**
    //  * Returns the qname of a IRI if the prefix-namespace is found, null otherwise
    //  * @param resource
    //  * @param prefixMapping 
    //  */
    // static getQName(iri: string, prefixMapping: PrefixMapping[]): string {
    //     for (var i = 0; i < prefixMapping.length; i++) {
    //         if (iri.startsWith(prefixMapping[i].namespace)) {
    //             return iri.replace(prefixMapping[i].namespace, prefixMapping[i].prefix + ":");
    //         }
    //     }
    //     return null;
    // }

    // /**
    //  * Returns true if the resource is in the staging (add or remove) graph, false otherwise
    //  * @param resource 
    //  */
    // static isReourceInStaging(resource: ARTNode): boolean {
    //     let graphs: ARTURIResource[] = resource.getGraphs();
    //     for (var i = 0; i < graphs.length; i++) {
    //         //I can't figure out why cannot use SemanticTurkey.stagingAddGraph here (error "cannot read 'cls' of undefined")
    //         // if (graphs[i].getURI() == SemanticTurkey.stagingAddGraph || graphs[i].getURI() == SemanticTurkey.stagingRemoveGraph) {
    //         if (graphs[i].getURI().startsWith("http://semanticturkey.uniroma2.it/ns/validation#staging-add-graph/") ||
    //             graphs[i].getURI().startsWith("http://semanticturkey.uniroma2.it/ns/validation#staging-remove-graph/")) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    // /**
    //  * Taken from it.uniroma2.art.semanticturkey.data.role.RDFResourceRoles
    //  * @param subsumer 
    //  * @param subsumee 
    //  * @param undeterminedSubsumeesAll 
    //  */
    // static roleSubsumes(subsumer: RDFResourceRolesEnum, subsumee: RDFResourceRolesEnum, undeterminedSubsumeesAll?: boolean) {
    //     if (subsumer == subsumee) {
    //         return true;
    //     }
    //     if (subsumer == RDFResourceRolesEnum.undetermined && undeterminedSubsumeesAll) {
    //         return true;
    //     }
    //     if (subsumer == RDFResourceRolesEnum.property) {
    //         return subsumee == RDFResourceRolesEnum.objectProperty || subsumee == RDFResourceRolesEnum.datatypeProperty
    //             || subsumee == RDFResourceRolesEnum.annotationProperty || subsumee == RDFResourceRolesEnum.ontologyProperty;
    //     }
    //     if (subsumer == RDFResourceRolesEnum.skosCollection && subsumee == RDFResourceRolesEnum.skosOrderedCollection) {
    //         return true;
    //     }
    //     return false;
    // }

    // static testIRI(iri: string) {
    //     let iriRegexp = new RegExp("\\b(https?|ftp|file)://[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#/%=~_|]");
    //     return iriRegexp.test(iri);
    // }

}


export class ResAttribute {
    public static SHOW = "show";
    public static QNAME = "qname";
    public static ROLE = "role";
    public static EXPLICIT = "explicit";
    public static MORE = "more";
    public static LANG = "lang";
    public static GRAPHS = "graphs"; //used in getResourceView response
    public static NATURE = "nature"; //content is a triple separated by "-": <uri of class of resource> - <graph of ???> - <deprecated true/false>

    public static DEPRECATED = "deprecated";

    //never in st responses, added because are useful for tree
    public static SELECTED = "selected"; //if true, render the node as selected
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