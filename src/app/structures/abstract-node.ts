import { Directive, EventEmitter, Input, Output } from "@angular/core";
import { Subscription } from 'rxjs';
import { AnnotatedValue, IRI } from '../models/Resources';
import { TreeListContext } from '../utils/UIUtils';

@Directive()
export abstract class AbstractNode {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    @Input() node: AnnotatedValue<IRI>;
    @Input() rendering: boolean; //if true the node be rendered with the show, with the qname otherwise
    @Input() showDeprecated: boolean;
    @Input() context: TreeListContext;
    @Output() nodeSelected = new EventEmitter<AnnotatedValue<IRI>>();

    eventSubscriptions: Subscription[] = [];

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