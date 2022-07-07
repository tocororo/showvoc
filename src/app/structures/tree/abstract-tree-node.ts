import { ChangeDetectorRef, Directive, ElementRef, QueryList, SimpleChanges, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { TreeListContext } from 'src/app/utils/UIUtils';
import { AnnotatedValue, IRI, ResAttribute } from '../../models/Resources';
import { AbstractNode } from '../abstract-node';

@Directive()
export abstract class AbstractTreeNode extends AbstractNode {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    //get an element in the view referenced with #treeNodeElement (useful to apply scrollIntoView in the search function)
    @ViewChild('treeNodeElement') treeNodeElement: ElementRef;
    //<Class/Concept/..:>TreeNodeComponent children of this Component (useful to open tree for the search)
    abstract viewChildrenNode: QueryList<AbstractTreeNode>;

    /**
     * ATTRIBUTES
     */
    children: AnnotatedValue<IRI>[] = [];
    open: boolean = false;
    loading: boolean = false;

    showExpandCollapseBtn: boolean = false; //tells if the expand/collapse node button should be visible (it depends on more_attr and showDeprecated)

    /**
     * CONSTRUCTOR
     */
    private basicModals: BasicModalsServices;
    private sharedModals: SharedModalsServices;
    private changeDetectorRef: ChangeDetectorRef;

    constructor(basicModals: BasicModalsServices, sharedModals: SharedModalsServices, changeDetectorRef: ChangeDetectorRef) {
        super();
        this.basicModals = basicModals;
        this.sharedModals = sharedModals;
        this.changeDetectorRef = changeDetectorRef;
    }

    /**
     * METHODS
     */

    ngOnInit() {
        this.initShowExpandCollapseBtn();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['showDeprecated']) {
            this.initShowExpandCollapseBtn();
        }
    }

    /**
     * The expand/collapse button should be visible if:
     * the node has "more" attribute true AND
     * - "showDeprecated" is true (all children visible)
     * - or "showDeprecated" is false (only not-deprecated children visible) but there is at least a child not-deprecated 
     */
    protected initShowExpandCollapseBtn() {
        let more: boolean = this.node.getAttribute(ResAttribute.MORE);
        if (more) { //if the more attribute is true, doesn't implies that the button is visible, the node children could be all deprecated
            if (this.children.length > 0) {
                let childVisible: boolean = false; //true if showDeprecated true, or child not-deprecated
                for (let i = 0; i < this.children.length; i++) {
                    if (this.showDeprecated || !this.children[i].isDeprecated()) {
                        childVisible = true;
                        break;
                    }
                }
                //button visible if there is at least a visible child
                this.showExpandCollapseBtn = childVisible;
            } else { //no children and "more" true means that the node has not been yet expanded, so in the doubt return true
                this.showExpandCollapseBtn = true;
            }
        } else {
            this.showExpandCollapseBtn = false;
        }
    }

    /**
     * Implementation of the expansion. It calls the  service for getting the child of a node in the given tree
     */
    expandNode(): Observable<void> {
        this.loading = true;
        return this.expandNodeImpl().pipe(
            finalize(() => { this.loading = false; }),
            map(children => {
                this.children = children;
                this.open = true;
            })
        );
    }

    abstract expandNodeImpl(): Observable<AnnotatedValue<IRI>[]>;

    /**
           * Collapse the subtree div.
           */
    collapseNode() {
        this.open = false;
        this.children = [];
    }

    /**
     * Expand recursively the given path untill the final node.
     * If the given path is empty then the current node is the searched one, otherwise
     * the current node expands itself (if is closed), looks among its children for the following node of the path,
     * then call recursively expandPath() for the child node.
     */
    public expandPath(path: AnnotatedValue<IRI>[]) {
        if (path.length == 0) { //this is the last node of the path. Focus it in the tree
            this.selectNode();
            setTimeout(() => { //give time to update the view (after selectNode the res view could make reduce the size of the tree)
                this.treeNodeElement.nativeElement.scrollIntoView({ block: 'end', behavior: 'smooth' });
            });
        } else {
            if (!this.open) { //if node is close, expand itself
                this.expandNode().subscribe(
                    () => {
                        //trigger a round of change detection so that the view children are rendered
                        this.changeDetectorRef.detectChanges();
                        this.expandChild(path);
                    }
                );
            } else {
                this.expandChild(path);
            }
        }
    }

    private expandChild(path: AnnotatedValue<IRI>[]) {
        //If the deprecated nodes are hidden, check if the path pass through a deprecated node not visible
        if (!this.showDeprecated) {
            for (let i = 0; i < this.children.length; i++) {
                if (this.children[i].getValue().equals(path[0].getValue()) && this.children[i].isDeprecated()) {
                    this.basicModals.alert({ key: "COMMONS.ACTIONS.SEARCH" }, { key: "MESSAGES.RES_NOT_REACHABLE_IN_TREE_THROUGH_DEPRECATED", params: { resource: path[path.length - 1].getShow() } }, ModalType.warning);
                    return;
                }
            }
        }
        let nodeChildren = this.viewChildrenNode.toArray();
        for (let i = 0; i < nodeChildren.length; i++) { //for every ConceptTreeNodeComponent child
            if (nodeChildren[i].node.getValue().equals(path[0].getValue())) { //look for the next node of the path
                //let the child node expand the remaining path
                path.splice(0, 1);
                nodeChildren[i].expandPath(path);
                return;
            }
        }
        //if this line is reached it means that the first node of the path has not been found
        if (this.context == TreeListContext.dataPanel) {
            this.basicModals.confirm({ key: "COMMONS.ACTIONS.SEARCH" }, { key: "MESSAGES.RES_NOT_REACHABLE_IN_TREE_DIALOG_RES_VIEW_CONFIRM", params: { resource: path[path.length - 1].getShow() } }, ModalType.warning).then(
                confirm => {
                    this.sharedModals.openResourceView(path[path.length - 1].getValue());
                },
                cancel => { }
            );
        } else {
            this.basicModals.alert({ key: "COMMONS.ACTIONS.SEARCH" }, { key: "MESSAGES.RES_NOT_REACHABLE_IN_TREE", params: { resource: path[path.length - 1].getShow() } }, ModalType.warning);
        }
    }


    /**
     * Listener to the nodeSelected @Output event, called when a node in the subTree is clicked
     */
    onNodeSelected(node: AnnotatedValue<IRI>) {
        this.nodeSelected.emit(node);
    }

}