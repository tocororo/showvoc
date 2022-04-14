import { PrefixMapping } from '../models/Metadata';
import { AnnotatedValue, BNode, IRI, Literal, PredicateObjects, RDFResourceRolesEnum, ResAttribute, Resource, ShowInterpretation, Value } from '../models/Resources';
import { Lime, OntoLex, OWL, RDF, RDFS, SemanticTurkey, SKOS, SKOSXL } from '../models/Vocabulary';
import { SVContext } from './SVContext';

export class ResourceUtils {

    /**
     * Sort an Array of annotated values by the given attribute.
     * @param list 
     * @param attribute
     */
    static sortResources(list: AnnotatedValue<Value>[], attribute: SortAttribute): void {
        //sort by show
        if (attribute == SortAttribute.show) {
            let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
            list.sort((r1: AnnotatedValue<Value>, r2: AnnotatedValue<Value>) => {
                //if both resources have language tag (literals or reified resources with lang), sort according lang
                if (r1.getLanguage() != null && r2.getLanguage() != null) {
                    if (r1.getLanguage() < r2.getLanguage()) return -1;
                    if (r1.getLanguage() > r2.getLanguage()) return 1;
                    //same lang code, order alphabetically
                    return collator.compare(r1.getShow().toLowerCase(), r2.getShow().toLowerCase());
                } else {
                    return collator.compare(r1.getShow().toLowerCase(), r2.getShow().toLowerCase());
                }
            });
        }
        if (attribute == SortAttribute.value) {
            list.sort((r1: AnnotatedValue<Value>, r2: AnnotatedValue<Value>) => {
                return r1.getValue().stringValue().localeCompare(r2.getValue().stringValue());
            });
        }
    }

    /**
     * Tells if a list contains a given node
     */
    static containsNode<T extends Value>(list: AnnotatedValue<T>[], node: T): boolean {
        return this.indexOfNode(list, node) != -1;
    }
    static indexOfNode<T extends Value>(list: AnnotatedValue<T>[], node: T): number {
        for (let i = 0; i < list.length; i++) {
            if (list[i].getValue().equals(node)) {
                return i;
            }
        }
        return -1;
    }

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

    /**
     * Returns the qname of a IRI if the prefix-namespace is found, the same IRI otherwise
     * @param resource
     * @param prefixMapping 
     */
    static getQName(iri: string, prefixMapping: PrefixMapping[]): string {
        for (let mapping of prefixMapping) {
            if (iri.startsWith(mapping.namespace)) {
                return iri.replace(mapping.namespace, mapping.prefix + ":");
            }
        }
        return iri;
    }

    /**
     * Returns true if the resource is in the staging (add or remove) graph, false otherwise
     * @param resource 
     */
    static isResourceInStaging(resource: AnnotatedValue<Value>): boolean {
        return this.isResourceInStagingAdd(resource) || this.isResourceInStagingRemove(resource);
    }
    static isResourceInStagingAdd(resource: AnnotatedValue<Value>): boolean {
        let graphs: IRI[] = resource.getResourceGraphs();
        for (let i = 0; i < graphs.length; i++) {
            if (graphs[i].getIRI().startsWith(SemanticTurkey.stagingAddGraph)) {
                return true;
            }
        }
        return false;
    }
    static isResourceInStagingRemove(resource: AnnotatedValue<Value>): boolean {
        let graphs: IRI[] = resource.getResourceGraphs();
        for (let i = 0; i < graphs.length; i++) {
            if (graphs[i].getIRI().startsWith(SemanticTurkey.stagingRemoveGraph)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns true if the triple (which the resource respresents the object) is in the staging (add or remove) graph, false otherwise
     * @param resource 
     */
    static isTripleInStaging(resource: AnnotatedValue<Value>): boolean {
        return this.isTripleInStagingAdd(resource) || this.isTripleInStagingRemove(resource);
    }
    static isTripleInStagingAdd(resource: AnnotatedValue<Value>): boolean {
        let graphs: IRI[] = resource.getTripleGraphs();
        for (let i = 0; i < graphs.length; i++) {
            if (graphs[i].getIRI().startsWith(SemanticTurkey.stagingAddGraph)) {
                return true;
            }
        }
        return false;
    }
    static isTripleInStagingRemove(resource: AnnotatedValue<Value>): boolean {
        let graphs: IRI[] = resource.getTripleGraphs();
        for (let i = 0; i < graphs.length; i++) {
            if (graphs[i].getIRI().startsWith(SemanticTurkey.stagingRemoveGraph)) {
                return true;
            }
        }
        return false;
    }

    static convertRoleToClass(role: RDFResourceRolesEnum, modelType?: string): IRI {
        let roleClass: IRI;
        if (role == RDFResourceRolesEnum.annotationProperty) {
            roleClass = OWL.annotationProperty;
        } else if (role == RDFResourceRolesEnum.cls) {
            roleClass = modelType == RDFS.uri ? RDFS.class : OWL.class;
        } else if (role == RDFResourceRolesEnum.concept) {
            roleClass = modelType == OntoLex.uri ? OntoLex.lexicalConcept : SKOS.concept;
        } else if (role == RDFResourceRolesEnum.conceptScheme) {
            roleClass = modelType == OntoLex.uri ? OntoLex.conceptSet : SKOS.conceptScheme;
        } else if (role == RDFResourceRolesEnum.dataRange) {
            roleClass = OWL.dataRange;
        } else if (role == RDFResourceRolesEnum.datatypeProperty) {
            roleClass = OWL.datatypeProperty;
        } else if (role == RDFResourceRolesEnum.limeLexicon) {
            roleClass = Lime.lexicon;
        } else if (role == RDFResourceRolesEnum.objectProperty) {
            roleClass = OWL.objectProperty;
        } else if (role == RDFResourceRolesEnum.ontolexForm) {
            roleClass = OntoLex.form;
        } else if (role == RDFResourceRolesEnum.ontolexLexicalEntry) {
            roleClass = OntoLex.lexicalEntry;
        } else if (role == RDFResourceRolesEnum.ontolexLexicalSense) {
            roleClass = OntoLex.lexicalSense;
        } else if (role == RDFResourceRolesEnum.ontology) {
            roleClass = OWL.ontology;
        } else if (role == RDFResourceRolesEnum.ontologyProperty) {
            roleClass = OWL.ontologyProperty;
        } else if (role == RDFResourceRolesEnum.property) {
            roleClass = RDF.property;
        } else if (role == RDFResourceRolesEnum.skosCollection) {
            roleClass = SKOS.collection;
        } else if (role == RDFResourceRolesEnum.skosOrderedCollection) {
            roleClass = SKOS.orderedCollection;
        } else if (role == RDFResourceRolesEnum.xLabel) {
            roleClass = SKOSXL.label;
        }
        return roleClass;
    }

    /**
     * Taken from it.uniroma2.art.semanticturkey.data.role.RDFResourceRoles
     * @param subsumer 
     * @param subsumee 
     * @param undeterminedSubsumeesAll 
     */
    static roleSubsumes(subsumer: RDFResourceRolesEnum, subsumee: RDFResourceRolesEnum, undeterminedSubsumeesAll?: boolean) {
        if (subsumer == subsumee) {
            return true;
        }
        if (subsumer == RDFResourceRolesEnum.undetermined && undeterminedSubsumeesAll) {
            return true;
        }
        if (subsumer == RDFResourceRolesEnum.property) {
            return subsumee == RDFResourceRolesEnum.objectProperty || subsumee == RDFResourceRolesEnum.datatypeProperty
                || subsumee == RDFResourceRolesEnum.annotationProperty || subsumee == RDFResourceRolesEnum.ontologyProperty;
        }
        if (subsumer == RDFResourceRolesEnum.skosCollection && subsumee == RDFResourceRolesEnum.skosOrderedCollection) {
            return true;
        }
        return false;
    }

    static getResourceRoleLabel(role: RDFResourceRolesEnum): string {
        if (role == RDFResourceRolesEnum.cls) {
            return "Class";
        } else if (role == RDFResourceRolesEnum.xLabel) {
            return "Skosxl Label";
        } else {
            let splitted: string = role.replace(/([a-z])([A-Z])/g, '$1 $2');
            return splitted.charAt(0).toLocaleUpperCase() + splitted.slice(1); //upper case the first letter
        }
    }

}

export enum SortAttribute {
    value = "value",
    show = "show"
}


export class ResourceDeserializer {

    /**
     * Creates an ARTURIResource from a Json Object {"@id": string, "show": string, "role": string, ...other optional attributes}
     */
    public static createIRI(valueJson: any, additionalAttr?: string[]): AnnotatedValue<IRI> {
        let id: string = valueJson['@id'];
        let value: IRI = new IRI(id);
        return this.annotateValue(valueJson, value, additionalAttr);
    }

    public static createBlankNode(valueJson: any, additionalAttr?: string[]): AnnotatedValue<BNode> {
        let id = valueJson['@id'];
        let value: BNode = new BNode(id);
        return this.annotateValue(valueJson, value, additionalAttr);
    }

    public static createLiteral(valueJson: any, additionalAttr?: string[]): AnnotatedValue<Literal> {
        let litValue = valueJson['@value'];
        let value: Literal = new Literal(litValue);
        let datatype = valueJson['@type'];
        if (datatype != undefined) {
            value.setDatatype(new IRI(datatype));
        }
        let lang = valueJson[ResAttribute.LANG];
        if (lang == undefined) {
            lang = valueJson["@language"];
        }
        if (lang != undefined) {
            value.setLanguage(lang);
        }
        return this.annotateValue(valueJson, value, additionalAttr);
    }

    /**
     * 
     * @param resJson 
     * @param value 
     * @param additionalAttr list of non common attributes to parse
     */
    private static annotateValue<T extends Value>(resJson: any, value: T, additionalAttr?: string[]): AnnotatedValue<T> {
        let annotatedValue = new AnnotatedValue(value);

        let show: string = resJson[ResAttribute.SHOW];
        if (show != undefined) {
            annotatedValue.setAttribute(ResAttribute.SHOW, show);
        }
        let qname: string = resJson[ResAttribute.QNAME];
        if (qname != undefined) {
            annotatedValue.setAttribute(ResAttribute.QNAME, qname);
        }
        let explicit: boolean = resJson[ResAttribute.EXPLICIT];
        if (explicit != undefined) {
            annotatedValue.setAttribute(ResAttribute.EXPLICIT, explicit);
        }
        let more: boolean = resJson[ResAttribute.MORE];
        if (more != undefined) {
            annotatedValue.setAttribute(ResAttribute.MORE, more);
        }
        let numInst: number = resJson[ResAttribute.NUM_INST];
        if (numInst != undefined) {
            annotatedValue.setAttribute(ResAttribute.NUM_INST, numInst);
        }
        let hasCustomRange: boolean = resJson[ResAttribute.HAS_CUSTOM_RANGE];
        if (hasCustomRange != undefined) {
            annotatedValue.setAttribute(ResAttribute.HAS_CUSTOM_RANGE, hasCustomRange);
        }
        let resourcePosition: string = resJson[ResAttribute.RESOURCE_POSITION];
        if (resourcePosition != undefined) {
            annotatedValue.setAttribute(ResAttribute.RESOURCE_POSITION, resourcePosition);
        }
        let accessMethod: string = resJson[ResAttribute.ACCESS_METHOD];
        if (accessMethod != undefined) {
            annotatedValue.setAttribute(ResAttribute.ACCESS_METHOD, accessMethod);
        }
        let lang: string = resJson[ResAttribute.LANG];
        if (lang != undefined) {
            annotatedValue.setAttribute(ResAttribute.LANG, lang);
        }
        let graphsAttr: string = resJson[ResAttribute.GRAPHS];
        if (graphsAttr != undefined) {
            let splittedGraph: string[] = graphsAttr.split(",");
            let graphs: IRI[] = [];
            for (let i = 0; i < splittedGraph.length; i++) {
                graphs.push(new IRI(splittedGraph[i]));
            }
            annotatedValue.setAttribute(ResAttribute.GRAPHS, graphs);
        }
        let members: any[] = resJson[ResAttribute.MEMBERS];
        if (members != undefined) {
            annotatedValue.setAttribute(ResAttribute.MEMBERS, this.createResourceArray(members, additionalAttr));
        }
        let index: any = resJson[ResAttribute.INDEX];
        if (index != undefined) {
            annotatedValue.setAttribute(ResAttribute.INDEX, this.createLiteral(index, additionalAttr));
        }
        let inScheme: string = resJson[ResAttribute.IN_SCHEME];
        if (inScheme != undefined) {
            annotatedValue.setAttribute(ResAttribute.IN_SCHEME, inScheme);
        }
        let schemesAttr: string = resJson[ResAttribute.SCHEMES];
        if (schemesAttr != undefined) {
            let schemes: IRI[] = [];
            if (schemesAttr != "") {
                let splittedSchemes: string[] = schemesAttr.split(",");
                for (let i = 0; i < splittedSchemes.length; i++) {
                    schemes.push(new IRI(splittedSchemes[i].trim()));
                }
            }
            annotatedValue.setAttribute(ResAttribute.SCHEMES, schemes);
        }

        if (value instanceof Resource) {
            let role: RDFResourceRolesEnum = <RDFResourceRolesEnum>resJson[ResAttribute.ROLE];
            if (role != undefined) {
                annotatedValue.setAttribute(ResAttribute.ROLE, role);
            }

            let natureAttr: string = resJson[ResAttribute.NATURE];
            if (natureAttr != undefined && natureAttr != "") {
                let splitted: string[] = natureAttr.split("|_|");
                for (let i = 0; i < splitted.length; i++) {
                    let roleGraphDeprecated: string[] = splitted[i].split(",");
                    let roleInNature: RDFResourceRolesEnum = <RDFResourceRolesEnum>roleGraphDeprecated[0];
                    let graphInNature: IRI = new IRI(roleGraphDeprecated[1]);
                    annotatedValue.setAttribute(ResAttribute.ROLE, roleInNature); //in this way I set the last role encountered in the nature
                    annotatedValue.addNature(roleInNature, graphInNature);
                    //I set the last deprecated encountered but it doesn't matter since the deprecated value is the same in all the role-graph-deprecated triples
                    annotatedValue.setAttribute(ResAttribute.DEPRECATED, roleGraphDeprecated[2] == "true");
                }

                /**
                 * if explicit is null => explicit attribute was missing => infer it from the graphs in the nature:
                 * explicit is true if the resource is defined in the main graph (but not in the remove-staging)
                 */
                if (annotatedValue.getAttribute(ResAttribute.EXPLICIT) == null) {
                    let baseURI = SVContext.getWorkingProject() ? SVContext.getWorkingProject().getBaseURI() : null;
                    let resGraphs: IRI[] = annotatedValue.getResourceGraphs();
                    let inMainGraph: boolean = false;
                    let inRemoveStagingGraph: boolean = false;
                    for (let i = 0; i < resGraphs.length; i++) {
                        if (resGraphs[i].getIRI() == baseURI) {
                            inMainGraph = true;
                        } else if (resGraphs[i].getIRI().startsWith(SemanticTurkey.stagingRemoveGraph)) {
                            inRemoveStagingGraph = true;
                        }
                    }
                    if (inMainGraph && !inRemoveStagingGraph) {
                        annotatedValue.setAttribute(ResAttribute.EXPLICIT, true);
                    }
                }
                //if explicit is still null, set it to false
                if (annotatedValue.getAttribute(ResAttribute.EXPLICIT) == null) {
                    annotatedValue.setAttribute(ResAttribute.EXPLICIT, false);
                }
            }

            //patch to override the show of the dataRange (that could be very long) with a shorter version
            if (annotatedValue.getAttribute(ResAttribute.ROLE) == RDFResourceRolesEnum.dataRange) {
                let charLimit: number = 50;
                let dataRangeShow = annotatedValue.getShow();
                if (dataRangeShow.length > charLimit) {
                    let shortShow: string = "";
                    let splitted: string[] = dataRangeShow.split(",");
                    let i = 0;
                    while (shortShow.length < charLimit) {
                        shortShow += splitted[i] + ",";
                        i++;
                    }
                    shortShow += " ...}";
                    annotatedValue.setAttribute(ResAttribute.SHOW, shortShow);
                }
            }
        }

        let tripleScope: string = resJson[ResAttribute.TRIPLE_SCOPE];
        if (tripleScope != undefined) {
            annotatedValue.setAttribute(ResAttribute.TRIPLE_SCOPE, tripleScope);
        }

        let showInterpr: ShowInterpretation = resJson[ResAttribute.SHOW_INTERPR];
        if (showInterpr != null) {
            annotatedValue.setAttribute(ResAttribute.SHOW_INTERPR, showInterpr);
        }

        if (additionalAttr != undefined) {
            for (let i = 0; i < additionalAttr.length; i++) {
                let attrValue: string = resJson[additionalAttr[i]];
                if (attrValue != undefined) {
                    annotatedValue.setAttribute(additionalAttr[i], attrValue);
                }
            }
        }

        return annotatedValue;
    }

    public static createResource(resourceJson: any, additionalAttr?: string[]): AnnotatedValue<Resource> {
        let resId = resourceJson['@id'];
        if (resourceJson['@id'] != undefined) {
            if (resId.startsWith('_:')) {
                return this.createBlankNode(resourceJson, additionalAttr);
            } else {
                return this.createIRI(resourceJson, additionalAttr);
            }
        } else {
            throw new Error("Not a RDFResource");
        }
    }

    public static createValue(nodeJson: any, additionalAttr?: string[]): AnnotatedValue<Value> {
        let nodeId: string = nodeJson['@id']; //resource
        let nodeValue: string = nodeJson['@value']; //literal
        if (nodeId != undefined) {
            return this.createResource(nodeJson, additionalAttr);
        } else if (nodeValue != undefined) {
            return this.createLiteral(nodeJson, additionalAttr);
        } else {
            throw new Error("Not a RDFNode");
        }
    }

    /**
     * creates an array of only ARTURIResource from a json result
     */
    public static createIRIArray(result: Array<any>, additionalAttr?: string[]): AnnotatedValue<IRI>[] {
        let uriResourceArray: AnnotatedValue<IRI>[] = [];
        for (let i = 0; i < result.length; i++) {
            uriResourceArray.push(this.createIRI(result[i], additionalAttr));
        }
        return uriResourceArray;
    }

    public static createResourceArray(resArray: any[], additionalAttr?: string[]): AnnotatedValue<Resource>[] {
        let resourceArray: AnnotatedValue<Resource>[] = [];
        for (let i = 0; i < resArray.length; i++) {
            resourceArray.push(this.createResource(resArray[i], additionalAttr));
        }
        return resourceArray;
    }

    public static createLiteralArray(result: Array<any>, additionalAttr?: string[]): AnnotatedValue<Literal>[] {
        let literalArray: AnnotatedValue<Literal>[] = [];
        for (let i = 0; i < result.length; i++) {
            literalArray.push(this.createLiteral(result[i], additionalAttr));
        }
        return literalArray;
    }

    public static createValueArray(nodeArray: any, additionalAttr?: string[]): AnnotatedValue<Value>[] {
        let collectionArray: AnnotatedValue<Value>[] = [];
        for (let i = 0; i < nodeArray.length; i++) {
            collectionArray.push(this.createValue(nodeArray[i], additionalAttr));
        }
        return collectionArray;
    }

    public static createPredicateObjectsList(poList: any, additionalAttr?: string[]): PredicateObjects[] {
        let poLists: PredicateObjects[] = [];
        for (let i = 0; i < poList.length; i++) {
            let predicate = this.createIRI(poList[i].predicate, additionalAttr);
            let objects = this.createValueArray(poList[i].objects, additionalAttr);
            let predicateObjects = new PredicateObjects(predicate, objects);
            poLists.push(predicateObjects);
        }
        //need to sort for predicate?
        // poLists.sort((po1, po2) => {
        //     return po1.getPredicate().getShow().localeCompare(po2.getPredicate().getShow());
        // })
        return poLists;
    }

}



export class NTriplesUtil {

    /**
     * 
     * @param nTripleValue 
     */
    static parseValue(nTripleValue: string): Value {
        let value: Value;
        try {
            value = NTriplesUtil.parseIRI(nTripleValue);
        } catch (err) {
            console.error(err);
        }
        if (value == null) {
            try {
                value = NTriplesUtil.parseLiteral(nTripleValue);
            } catch (err) {
                console.error(err);
            }
        }
        if (value == null) {
            try {
                value = NTriplesUtil.parseBNode(nTripleValue);
            } catch (err) {
                console.error(err);
            }
        }
        if (value == null) {
            throw new Error("Not a legal N-Triples representation: " + nTripleValue);
        }
        return value;
    }

    /**
     * Given an NT serialization of a URI, creates and returns an ARTURIResource object.
     * Code inspired by org.eclipse.rdf4j.rio.ntriples.NTripleUtils#parseURI()
     * @param nTriplesURI 
     */
    static parseIRI(nTriplesURI: string): IRI {
        if (nTriplesURI.startsWith("<") && nTriplesURI.endsWith(">")) {
            let iri: string = nTriplesURI.substring(1, nTriplesURI.length - 1);
            iri = decodeURI(iri);
            return new IRI(iri);
        }
        else {
            throw new Error("Not a legal N-Triples URI: " + nTriplesURI);
        }
    }

    /**
     * Given an NT serialization of a literal, creates and returns an ARTLiteral object.
     * Code inspired by org.eclipse.rdf4j.rio.ntriples.NTripleUtils#parseLiteral()
     * @param nTriplesLiteral
     */
    static parseLiteral(nTriplesLiteral: string): Literal {
        if (nTriplesLiteral.startsWith("\"")) {
            // Find string separation points
            let endLabelIdx: number = this.findEndOfLabel(nTriplesLiteral);

            if (endLabelIdx != -1) {
                let startLangIdx: number = nTriplesLiteral.indexOf("@", endLabelIdx);
                let startDtIdx: number = nTriplesLiteral.indexOf("^^", endLabelIdx);

                if (startLangIdx != -1 && startDtIdx != -1) {
                    throw new Error("Literals can not have both a language and a datatype");
                }

                // Get label
                let label: string = nTriplesLiteral.substring(1, endLabelIdx);
                label = label.replace(/\\"/g, '"');

                if (startLangIdx != -1) {
                    // Get language
                    let language: string = nTriplesLiteral.substring(startLangIdx + 1);
                    return new Literal(label, language);
                }
                else if (startDtIdx != -1) {
                    // Get datatype
                    let datatype: string = nTriplesLiteral.substring(startDtIdx + 2);
                    let dtURI: IRI = this.parseIRI(datatype);
                    return new Literal(label, null, dtURI);
                }
                else {
                    return new Literal(label);
                }
            }
        }
        throw new Error("Not a legal N-Triples literal: " + nTriplesLiteral);
    }

    /**
     * Finds the end of the label in a literal string. This method takes into account that characters can be
     * escaped using backslashes.
     * Code inspired by org.eclipse.rdf4j.rio.ntriples.NTripleUtils#parseLiteral()
     * 
     * @return The index of the double quote ending the label, or <tt>-1</tt> if it could not be found.
     */
    private static findEndOfLabel(nTriplesLiteral: string): number {
        // First character of literal is guaranteed to be a double
        // quote, start search at second character.
        let previousWasBackslash: boolean = false;
        for (let i = 1; i < nTriplesLiteral.length; i++) {
            let c: string = nTriplesLiteral.charAt(i);
            if (c == '"' && !previousWasBackslash) {
                return i;
            }
            else if (c == '\\' && !previousWasBackslash) {
                previousWasBackslash = true; // start of escape
            }
            else if (previousWasBackslash) {
                previousWasBackslash = false; // c was escaped
            }
        }
        return -1;
    }

    static parseBNode(nTriplesBNode: string): BNode {
        if (nTriplesBNode.startsWith("_:")) {
            return new BNode(nTriplesBNode);
        } else {
            throw new Error("Not a legal N-Triples Blank Node: " + nTriplesBNode);
        }
    }

}