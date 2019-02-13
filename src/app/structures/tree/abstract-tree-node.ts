import { AbstractNode } from '../abstract-node';
import { AnnotatedValue, IRI, ResAttribute } from '../../models/Resources';
import { Observable } from 'rxjs';

export abstract class AbstractTreeNode extends AbstractNode {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    /**
     * ATTRIBUTES
     */
    children: AnnotatedValue<IRI>[] = [];
    open: boolean = false;
    loading: boolean = false;

    /**
     * CONSTRUCTOR
     */
    constructor() {
        super();
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
    expandNode() {
        this.loading = true;
        this.expandNodeImpl().subscribe(
            children => {
                this.loading = false;
                this.children = children;
                this.open = true;
            }
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
     * Listener to the nodeSelected @Output event, called when a node in the subTree is clicked
     */
    private onNodeSelected(node: AnnotatedValue<IRI>) {
        this.nodeSelected.emit(node);
    }

}