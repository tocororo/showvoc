import { EventEmitter, Input, Output, OnInit } from "@angular/core";
import { AnnotatedValue, IRI, ResAttribute, RDFResourceRolesEnum } from '../models/Resources';
import { Subscription } from 'rxjs';
import { PMKIEventHandler } from '../utils/PMKIEventHandler';

export abstract class AbstractStruct implements OnInit {

    @Input() rendering: boolean = true; //if true the nodes in the list should be rendered with the show, with the qname otherwise
    @Input() role: RDFResourceRolesEnum;
    @Output() nodeSelected = new EventEmitter<AnnotatedValue<IRI>>();

    /**
     * ATTRIBUTES
     */

    eventSubscriptions: Subscription[] = [];

    selectedNode: AnnotatedValue<IRI>;
    loading: boolean = false;

    /**
     * CONSTRUCTOR
     */
    protected eventHandler: PMKIEventHandler;
    constructor(eventHandler: PMKIEventHandler) {
        this.eventHandler = eventHandler;
    }

    /**
     * METHODS
     */

    ngOnInit() {
        this.init();
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }


    abstract init(): void;

    abstract setInitialStatus(): void

    private onNodeSelected(node: AnnotatedValue<IRI>) {
        if (this.selectedNode != undefined) {
            this.selectedNode.deleteAttribute(ResAttribute.SELECTED);
        }
        this.selectedNode = node;
        this.selectedNode.setAttribute(ResAttribute.SELECTED, true);
        this.nodeSelected.emit(node);
    }

}