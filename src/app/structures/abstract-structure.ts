import { EventEmitter, Input, OnInit, Output, ElementRef, ViewChild, Directive } from "@angular/core";
import { Subscription } from 'rxjs';
import { AnnotatedValue, IRI, RDFResourceRolesEnum, ResAttribute } from '../models/Resources';
import { SVEventHandler } from '../utils/SVEventHandler';
import { TreeListContext } from '../utils/UIUtils';

@Directive()
export abstract class AbstractStruct implements OnInit {

    @Input() rendering: boolean = true; //if true the nodes in the list should be rendered with the show, with the qname otherwise
    @Input() showDeprecated: boolean = true;
    @Input() context: TreeListContext;
    @Output() nodeSelected = new EventEmitter<AnnotatedValue<IRI>>();

    @ViewChild('scrollableContainer') scrollableElement: ElementRef;

    /**
     * ATTRIBUTES
     */

    abstract structRole: RDFResourceRolesEnum; //declare the type of resources in the panel

    nodes: AnnotatedValue<IRI>[];
    selectedNode: AnnotatedValue<IRI>;

    loading: boolean = false;

    eventSubscriptions: Subscription[] = [];

    /**
     * CONSTRUCTOR
     */
    protected eventHandler: SVEventHandler;
    constructor(eventHandler: SVEventHandler) {
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

    setInitialStatus() {
        this.nodes = [];
        this.selectedNode = null;
        this.nodeSelected.emit(this.selectedNode);
        this.nodesLimit = this.initialNodes;
    }

    onNodeSelected(node: AnnotatedValue<IRI>) {
        if (this.selectedNode != undefined) {
            this.selectedNode.deleteAttribute(ResAttribute.SELECTED);
        }
        this.selectedNode = node;
        this.selectedNode.setAttribute(ResAttribute.SELECTED, true);
        this.nodeSelected.emit(node);
    }

    //Root limitation management
    initialNodes: number = 100;
    nodesLimit: number = this.initialNodes;
    increaseRate: number = this.nodesLimit/5;
    onScroll() {
        let scrollElement: HTMLElement = this.scrollableElement.nativeElement;
        if (scrollElement.scrollTop === (scrollElement.scrollHeight - scrollElement.offsetHeight)) {
            //bottom reached => increase max range if there are more roots to show
            if (this.nodesLimit < this.nodes.length) { 
                this.nodesLimit += this.increaseRate;
            }
        } 
    }

}