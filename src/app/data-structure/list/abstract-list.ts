import { AnnotatedValue, IRI, ResAttribute } from '../../models/Resources';
import { AbstractStruct } from '../abstract-structure';

export abstract class AbstractList extends AbstractStruct {

    /**
     * ATTRIBUTES
     */

    // nodes: any[]; //any since the node of the list could be an AnnotatedValue or a SchemeListItem (in case of scheme list)
    nodes: AnnotatedValue<IRI>[];

    /**
     * CONSTRUCTOR
     */
    constructor() {
        super();
    }

    /**
     * METHODS
     */

    init() {
        this.setInitialStatus();        
        this.initImpl();
    }

    abstract initImpl(): void;

    setInitialStatus() {
        this.nodes = [];
        this.selectedNode = null;
        this.nodeSelected.emit(this.selectedNode);
    }

    /**
     * type of the node param depends on the list implementation
     * (for example in instance list it is an object with individual and its class, in scheme list it is simply the scheme)
     */
    // abstract selectNode(node: any): void;

    selectNode(node: AnnotatedValue<IRI>) {
        if (this.selectedNode != undefined) {
            this.selectedNode.deleteAttribute(ResAttribute.SELECTED);
        }
        this.selectedNode = node;
        this.selectedNode.setAttribute(ResAttribute.SELECTED, true);
        this.nodeSelected.emit(node);
    }

}