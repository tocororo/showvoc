import { EventEmitter, Input, Output, OnInit } from "@angular/core";
import { AnnotatedValue, IRI, ResAttribute, RDFResourceRolesEnum } from '../models/Resources';

export abstract class AbstractStruct implements OnInit {

    @Input() rendering: boolean = true; //if true the nodes in the list should be rendered with the show, with the qname otherwise
    @Input() role: RDFResourceRolesEnum;
    @Output() nodeSelected = new EventEmitter<AnnotatedValue<IRI>>();

    /**
     * ATTRIBUTES
     */

    selectedNode: AnnotatedValue<IRI>;
    loading: boolean = false;

    /**
     * CONSTRUCTOR
     */
    constructor() {
    }

    /**
     * METHODS
     */

    ngOnInit() {
        this.init();
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