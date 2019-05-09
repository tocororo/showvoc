import { AbstractNode } from '../abstract-node';
import { AnnotatedValue, IRI, ResAttribute } from '../../models/Resources';
import { Observable } from 'rxjs';
import { ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { map, finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { TreeListContext } from 'src/app/utils/UIUtils';

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

    /**
     * CONSTRUCTOR
     */
    private basicModals: BasicModalsServices
    constructor(basicModals: BasicModalsServices) {
        super();
        this.basicModals = basicModals;
    }

    /**
     * METHODS
     */

    /**
     * Tells if the expand/collapse button should be shown
     */
    showExpandCollapse(): boolean {
        return this.node.getAttribute(ResAttribute.MORE);
    }

    /**
     * Implementation of the expansion. It calls the  service for getting the child of a node in the given tree
     */
    expandNode(): Observable<any> {
        this.loading = true;
        return this.expandNodeImpl().pipe(
            finalize(() => this.loading = false),
            map(children => {
                this.children = children;
                this.open = true;
            })
        )
    };

    abstract expandNodeImpl(): Observable<AnnotatedValue<IRI>[]>;

    /**
   	 * Collapse the subtree div.
   	 */
    private collapseNode() {
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
            this.treeNodeElement.nativeElement.scrollIntoView({block: 'end', behavior: 'smooth'});
            this.selectNode();
        } else {
            if (!this.open) { //if node is close, expand itself
                this.expandNode().subscribe(
                    () => {
                        //trigger a round of change detection so that the view children are rendered
                        setTimeout(
                            () => {
                                this.expandChild(path);
                            }
                        );
                        
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
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i].getValue().equals(path[0].getValue()) && this.children[i].isDeprecated()) {
                    this.basicModals.alert("Search", "Node " + path[path.length-1].getShow() + 
                        " is not reachable in the current tree since the path to reach it contains a deprecated node." +
                        " Enable the show of deprecated resources and repeat the search", ModalType.warning);
                    return;
                }
            }
        }
        let nodeChildren = this.viewChildrenNode.toArray();
        for (var i = 0; i < nodeChildren.length; i++) {//for every ConceptTreeNodeComponent child
            if (nodeChildren[i].node.getValue().equals(path[0].getValue())) { //look for the next node of the path
                //let the child node expand the remaining path
                path.splice(0, 1);
                nodeChildren[i].expandPath(path);
                return;
            }
        }
        //if this line is reached it means that the first node of the path has not been found
        if (this.context == TreeListContext.dataPanel) {
            // this.basicModals.confirm("Search", "Node " + path[path.length-1].getShow() + " is not reachable in the current tree. "
            //     + "Do you want to open its ResourceView in a modal dialog?", ModalType.warning).then(
            //     confirm => { 
            //         this.sharedModals.openResourceView(path[path.length-1], false);
            //     },
            //     cancel => {}
            // );
        } else {
            this.basicModals.alert("Search", "Node " + path[path.length-1].getShow() + " is not reachable in the current tree.", ModalType.warning);
        }
    }


    /**
     * Listener to the nodeSelected @Output event, called when a node in the subTree is clicked
     */
    private onNodeSelected(node: AnnotatedValue<IRI>) {
        this.nodeSelected.emit(node);
    }

}