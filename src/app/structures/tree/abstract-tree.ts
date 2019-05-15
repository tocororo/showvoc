import { QueryList } from '@angular/core';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { TreeListContext } from 'src/app/utils/UIUtils';
import { AnnotatedValue, IRI } from '../../models/Resources';
import { AbstractStruct } from '../abstract-structure';
import { AbstractTreeNode } from './abstract-tree-node';

export abstract class AbstractTree extends AbstractStruct {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    abstract viewChildrenNode: QueryList<AbstractTreeNode>;

    /**
     * ATTRIBUTES
     */

    /**
     * Searched resource that is waiting to be expanded/selected once the root list is initialized.
     * This is expecially useful in case a search returns concept not in the current active scheme,
     * if the user activates the scheme which the concept belongs, it could be necessary to wait that the tree is initialized again 
     * (with the new scheme) and so once the roots are initialized it attempts again to expand the path to the searched concept 
     */
    protected pendingSearchPath: AnnotatedValue<IRI>[];

    /**
     * CONSTRUCTOR
     */
    protected basicModals: BasicModalsServices;
    protected sharedModals: SharedModalsServices;
    constructor(eventHandler: PMKIEventHandler, basicModals: BasicModalsServices, sharedModals: SharedModalsServices) {
        super(eventHandler);
        this.basicModals = basicModals;
        this.sharedModals = sharedModals;
    }

    /**
     * METHODS
     */

    init() {
        this.setInitialStatus();
        this.initImpl();
    }

    abstract initImpl(): void;

    abstract openTreeAt(node: AnnotatedValue<IRI>): void;

    /**
     * Ensures that the root of the searched path is visible.
     * If visible returns true, otherwise store the pending search and returns false.
     * @param resource 
     * @param path 
     */
    ensureRootVisibility(resource: AnnotatedValue<IRI>, path: AnnotatedValue<IRI>[]): boolean {
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].getValue().equals(resource.getValue())) { //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                if (i >= this.nodesLimit) {
                    //update rootLimit so that node at index i is within the range
                    let scrollStep: number = ((i - this.nodesLimit)/this.increaseRate)+1;
                    this.nodesLimit = this.nodesLimit + this.increaseRate*scrollStep;
                }
                //if there was any pending search, reset it
                if (this.pendingSearchPath) {
                    this.pendingSearchPath = null;
                }
                return true;
            }
        }
        //if this code is reached, the root is not found (so probably it is waiting that the roots are initialized)
        this.pendingSearchPath = path;
        return false;
    }

    expandPath(path: AnnotatedValue<IRI>[]) {
        //open tree from root to node
        if (this.ensureRootVisibility(path[0], path)) { //if root is visible
            setTimeout(() => { //wait the the UI is updated after the (possible) update of rootLimit
                var childrenNodeComponent = this.viewChildrenNode.toArray();
                for (var i = 0; i < childrenNodeComponent.length; i++) {//looking for first node (root) to expand
                    if (childrenNodeComponent[i].node.getValue().equals(path[0].getValue())) {
                        //let the found node expand itself and the remaining path
                        path.splice(0, 1);
                        childrenNodeComponent[i].expandPath(path);
                        return;
                    }
                }
            });
        }
    }

    onTreeNodeNotReachable(node: AnnotatedValue<IRI>) {
        if (this.context == TreeListContext.dataPanel) {
            this.basicModals.confirm("Search", "Node " + node.getShow() + " is not reachable in the current tree. "
                + "Do you want to open its ResourceView in a modal dialog?", ModalType.warning).then(
                confirm => { 
                    this.sharedModals.openResourceView(node.getValue());
                },
                () => {}
            );
        } else {
            this.basicModals.alert("Search", "Node " + node.getShow() + " is not reachable in the current tree.", ModalType.warning);
        }
    }


}