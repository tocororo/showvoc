import { AbstractStruct } from '../abstract-structure';
import { AnnotatedValue, IRI } from '../../models/Resources';

export abstract class AbstractTree extends AbstractStruct {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    /**
     * ATTRIBUTES
     */

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

    //BROADCAST EVENT HANDLERS


}