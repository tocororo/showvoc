import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { AnnotatedValue, IRI, ResAttribute } from '../../models/Resources';
import { AbstractStruct } from '../abstract-structure';
import { ListNodeComponent } from './list-node.component';
import { QueryList, ViewChildren } from '@angular/core';

export abstract class AbstractList extends AbstractStruct {

    @ViewChildren(ListNodeComponent) viewChildrenNode: QueryList<ListNodeComponent>;

    /**
     * ATTRIBUTES
     */

    protected pendingSearchRes: AnnotatedValue<IRI>; //searched resource that is waiting to be selected once the list is initialized

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

    selectNode(node: AnnotatedValue<IRI>) {
        if (this.selectedNode != undefined) {
            this.selectedNode.deleteAttribute(ResAttribute.SELECTED);
        }
        this.selectedNode = node;
        this.selectedNode.setAttribute(ResAttribute.SELECTED, true);
        this.nodeSelected.emit(node);
    }

    openListAt(node: AnnotatedValue<IRI>) {
        this.ensureNodeVisibility(node);
        setTimeout( //apply timeout in order to wait that the children node is rendered (in case the openPages has been increased)
            () => {
                var childrenNodeComponent = this.viewChildrenNode.toArray();
                for (var i = 0; i < childrenNodeComponent.length; i++) {
                    if (childrenNodeComponent[i].node.getValue().equals(node.getValue())) {
                        if (!childrenNodeComponent[i].node.getAttribute(ResAttribute.SELECTED)) {
                            childrenNodeComponent[i].selectNode();
                        }
                        setTimeout(() => { //give time to update the view (after selectNode the res view could make reduce the size of the tree)
                            childrenNodeComponent[i].ensureVisible();
                        });
                        break;
                    }
                }
            }
        );
    }

    ensureNodeVisibility(resource: AnnotatedValue<IRI>) {
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].getValue().equals(resource.getValue())) {
                if (i >= this.nodesLimit) {
                    //update nodeLimit so that node at index i is within the range
                    let scrollStep: number = ((i - this.nodesLimit)/this.increaseRate)+1;
                    this.nodesLimit = this.nodesLimit + this.increaseRate*scrollStep;
                }
                this.pendingSearchRes = null; //if there was any pending search, reset it
                return; //node found and visible
            }
        }
        //if this code is reached, the node is not found (so probably it is waiting that the list is initialized)
        this.pendingSearchRes = resource;
    }

}