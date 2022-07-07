import { ChangeDetectorRef, Directive, QueryList } from '@angular/core';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { SearchServices } from 'src/app/services/search.service';
import { SVEventHandler } from 'src/app/utils/SVEventHandler';
import { TreeListContext } from 'src/app/utils/UIUtils';
import { AnnotatedValue, IRI } from '../../models/Resources';
import { AbstractStruct } from '../abstract-structure';
import { AbstractTreeNode } from './abstract-tree-node';

@Directive()
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
    protected searchService: SearchServices;
    protected basicModals: BasicModalsServices;
    protected sharedModals: SharedModalsServices;
    protected changeDetectorRef: ChangeDetectorRef;
    constructor(eventHandler: SVEventHandler, searchService: SearchServices, basicModals: BasicModalsServices, sharedModals: SharedModalsServices, changeDetectorRef: ChangeDetectorRef) {
        super(eventHandler);
        this.searchService = searchService;
        this.basicModals = basicModals;
        this.sharedModals = sharedModals;
        this.changeDetectorRef = changeDetectorRef;
    }

    /**
     * METHODS
     */

    init() {
        this.setInitialStatus();
        this.initImpl();
    }

    abstract initImpl(): void;

    openTreeAt(node: AnnotatedValue<IRI>, schemes?: IRI[], root?: IRI) {
        this.searchService.getPathFromRoot(node.getValue(), this.structRole, schemes, root).subscribe(
            path => {
                if (path.length == 0) {
                    this.onTreeNodeNotReachable(node);
                }
                this.expandPath(path);
            }
        );
    }

    /**
     * Ensures that the root of the searched path is visible.
     * If visible returns true, otherwise store the pending search and returns false.
     * @param resource 
     * @param path 
     */
    ensureRootVisibility(resource: AnnotatedValue<IRI>, path: AnnotatedValue<IRI>[]): boolean {
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].getValue().equals(resource.getValue())) {
                if (i >= this.nodesLimit) {
                    //update rootLimit so that node at index i is within the range
                    let scrollStep: number = ((i - this.nodesLimit) / this.increaseRate) + 1;
                    this.nodesLimit += this.increaseRate * scrollStep;
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
            this.changeDetectorRef.detectChanges(); //wait the the UI is updated after the (possible) update of rootLimit
            let childrenNodeComponent = this.viewChildrenNode.toArray();
            for (let i = 0; i < childrenNodeComponent.length; i++) { //looking for first node (root) to expand
                if (childrenNodeComponent[i].node.getValue().equals(path[0].getValue())) {
                    //let the found node expand itself and the remaining path
                    path.splice(0, 1);
                    childrenNodeComponent[i].expandPath(path);
                    return;
                }
            }
        }
    }

    onTreeNodeNotReachable(node: AnnotatedValue<IRI>) {
        if (this.context == TreeListContext.dataPanel) {
            this.basicModals.confirm({ key: "COMMONS.ACTIONS.SEARCH" },
                { key: "MESSAGES.RES_NOT_REACHABLE_IN_TREE_DIALOG_RES_VIEW_CONFIRM", params: { resource: node.getShow() } },
                ModalType.warning).then(
                    confirm => {
                        this.sharedModals.openResourceView(node.getValue());
                    },
                    () => { }
                );
        } else {
            this.basicModals.alert({ key: "COMMONS.ACTIONS.SEARCH" }, { key: "MESSAGES.RES_NOT_REACHABLE_IN_TREE", params: { resource: node.getShow() } }, ModalType.warning);
        }
    }


}