import { RDFResourceRolesEnum, AnnotatedValue, IRI, ResAttribute } from 'src/app/models/Resources';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export class TreeServices {

    static getNodesImpl(role: RDFResourceRolesEnum): () => Observable<AnnotatedValue<IRI>[]> {
        return this.getNodesMap[role];
    }

    static getRootsImpl(role: RDFResourceRolesEnum): () => Observable<AnnotatedValue<IRI>[]> {
        return this.getRootsMap[role];
    }

    static getExpandNodeImpl(node: AnnotatedValue<IRI>, role: RDFResourceRolesEnum): (node: AnnotatedValue<IRI>) => Observable<AnnotatedValue<IRI>[]> {
        return this.expandNodeMap[role];
    }

    private static getRootsMap: { [key: string]: () => Observable<AnnotatedValue<IRI>[]> } = {
        concept: TreeServices.initRootConcept,
        property: TreeServices.initRootProperty,
        skosCollection: TreeServices.initRootCollection
    }

    private static expandNodeMap: { [key: string]: (node: AnnotatedValue<IRI>) => Observable<AnnotatedValue<IRI>[]> } = {
        concept: TreeServices.expandNodeConcept,
        property: TreeServices.expandNodeProperty,
        skosCollection: TreeServices.expandNodeCollection
    }

    private static getNodesMap: { [key: string]: () => Observable<AnnotatedValue<IRI>[]> } = {
        conceptScheme: TreeServices.getNodesConceptScheme,
        limeLexicon: TreeServices.getNodesLimeLexicon,
        ontolexLexicalEntry: TreeServices.getNodesLexicalEntry
    }

    /**
     * CONCEPT
     */
    private static initRootConcept(): Observable<AnnotatedValue<IRI>[]> {
        //TODO
        return TreeServices.initRoot(RDFResourceRolesEnum.concept);
    }
    private static expandNodeConcept(node: AnnotatedValue<IRI>): Observable<AnnotatedValue<IRI>[]> {
        //TODO
        return TreeServices.expandNode(node, RDFResourceRolesEnum.concept);
    }

    /**
     * CONCEPT SCHEME
     */
    private static getNodesConceptScheme(): Observable<AnnotatedValue<IRI>[]> {
        //TODO
        return TreeServices.getNodes(RDFResourceRolesEnum.conceptScheme);
    }

    /**
     * LIME LEXICON
     */
    private static getNodesLimeLexicon(): Observable<AnnotatedValue<IRI>[]> {
        //TODO
        return TreeServices.getNodes(RDFResourceRolesEnum.limeLexicon);
    }

    /**
     * ONTOLEX LEXICAL ENTRY
     */
    private static getNodesLexicalEntry(): Observable<AnnotatedValue<IRI>[]> {
        //TODO
        return TreeServices.getNodes(RDFResourceRolesEnum.ontolexLexicalEntry);
    }

    /**
     * PROPERTY
     */
    private static initRootProperty(): Observable<AnnotatedValue<IRI>[]> {
        //TODO
        return TreeServices.initRoot(RDFResourceRolesEnum.property);
    }
    private static expandNodeProperty(node: AnnotatedValue<IRI>): Observable<AnnotatedValue<IRI>[]> {
        //TODO
        return TreeServices.expandNode(node, RDFResourceRolesEnum.property);
    }

    /**
     * SKOS COLLECTION
     */
    private static initRootCollection(): Observable<AnnotatedValue<IRI>[]> {
        //TODO
        return TreeServices.initRoot(RDFResourceRolesEnum.skosCollection);
    }
    private static expandNodeCollection(node: AnnotatedValue<IRI>): Observable<AnnotatedValue<IRI>[]> {
        //TODO
        return TreeServices.expandNode(node, RDFResourceRolesEnum.skosCollection);
    }


    /**
     * Generic mockups
     */

    private static getNodes(role: RDFResourceRolesEnum) {
        let nodes: AnnotatedValue<IRI>[] = [];
        for (let i = 0; i < 10; i++) {
            let iri: IRI = new IRI("http://baseuri#" + role + i);
            let annotValue: AnnotatedValue<IRI> = new AnnotatedValue(iri);
            annotValue.setAttribute(ResAttribute.SHOW, ":" + iri.getLocalName());
            annotValue.setAttribute(ResAttribute.ROLE, role);
            nodes.push(annotValue);
        }
		return of(nodes).pipe(delay(500));
    }    

    private static initRoot(role: RDFResourceRolesEnum) {
        let nodes: AnnotatedValue<IRI>[] = [];
        for (let i = 0; i < 10; i++) {
            let iri: IRI = new IRI("http://baseuri#" + role + i);
            let annotValue: AnnotatedValue<IRI> = new AnnotatedValue(iri);
            annotValue.setAttribute(ResAttribute.SHOW, ":" + iri.getLocalName());
            annotValue.setAttribute(ResAttribute.ROLE, role);
            annotValue.setAttribute(ResAttribute.MORE, Math.random() > 0.5);
            nodes.push(annotValue);
        }
		return of(nodes).pipe(delay(500));
    }

    private static expandNode(node: AnnotatedValue<IRI>, role: RDFResourceRolesEnum): Observable<AnnotatedValue<IRI>[]> {
        let nodes: AnnotatedValue<IRI>[] = [];
        for (let i = 0; i < 3; i++) {
            let iri: IRI = new IRI(node.getValue().getIRI() + i);
            let annotValue: AnnotatedValue<IRI> = new AnnotatedValue(iri);
            annotValue.setAttribute(ResAttribute.SHOW, ":" + iri.getLocalName());
            annotValue.setAttribute(ResAttribute.ROLE, role);
            annotValue.setAttribute(ResAttribute.MORE, Math.random() > 0.8);
            nodes.push(annotValue);
        }
		return of(nodes).pipe(delay(500));
    }



}