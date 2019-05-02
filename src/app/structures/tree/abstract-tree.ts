import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { AnnotatedValue, IRI } from '../../models/Resources';
import { AbstractStruct } from '../abstract-structure';

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
    constructor(eventHandler: PMKIEventHandler) {
        super(eventHandler);
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