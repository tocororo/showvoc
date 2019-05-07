import { EventEmitter, Input, Output } from "@angular/core";
import { AnnotatedValue, IRI } from '../models/Resources';
import { TreeListContext } from '../utils/UIUtils';

export abstract class AbstractNode {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    @Input() node: AnnotatedValue<IRI>;
    @Input() rendering: boolean; //if true the node be rendered with the show, with the qname otherwise
    @Input() showDeprecated: boolean;
    @Input() context: TreeListContext;
    @Output() nodeSelected = new EventEmitter<AnnotatedValue<IRI>>();

    eventSubscriptions: any[] = [];

    /**
     * ATTRIBUTES
     */

    /**
     * CONSTRUCTOR
     */
    
    constructor() {
    }

    /**
     * METHODS
     */

    ngOnDestroy() {
    }

    selectNode() {
        this.nodeSelected.emit(this.node);
    }


}