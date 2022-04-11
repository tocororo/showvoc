import { Component, Input, QueryList, ViewChildren, SimpleChanges } from '@angular/core';
import { map } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { ClassTreeFilter } from 'src/app/models/Properties';
import { AnnotatedValue, IRI, ResAttribute } from 'src/app/models/Resources';
import { OWL, RDFS } from 'src/app/models/Vocabulary';
import { ClassesServices } from 'src/app/services/classes.service';
import { SVContext } from 'src/app/utils/SVContext';
import { SVEventHandler } from 'src/app/utils/SVEventHandler';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { TreeListContext } from 'src/app/utils/UIUtils';
import { AbstractTreeNode } from '../abstract-tree-node';

@Component({
    selector: 'class-tree-node',
    templateUrl: './class-tree-node.component.html',
})
export class ClassTreeNodeComponent extends AbstractTreeNode {

    //ClassTreeNodeComponent children of this Component (useful to open tree for the search)
    @ViewChildren(ClassTreeNodeComponent) viewChildrenNode: QueryList<ClassTreeNodeComponent>;

    @Input() root: boolean = false;
    @Input() filterEnabled: boolean = false;

    showInstanceNumber: boolean = false;

    constructor(private clsService: ClassesServices, private eventHandler: SVEventHandler,
        basicModals: BasicModalsServices, sharedModals: SharedModalsServices) {
        super(basicModals, sharedModals);

        this.eventSubscriptions.push(this.eventHandler.classFilterChangedEvent.subscribe(
            () => this.initShowExpandCollapseBtn()
        ));
    }

    ngOnInit() {
        super.ngOnInit();
        //show instance number only if enabled in the preferences and if the node belongs to a tree in TreePanelComponent
        this.showInstanceNumber = SVContext.getProjectCtx().getProjectPreferences().classTreePreferences.showInstancesNumber &&
            (this.context == TreeListContext.dataPanel || this.context == TreeListContext.clsIndTree);
        //expand immediately the node if it is a root and if it is owl:Thing or rdfs:Resource
        if ((this.node.getValue().equals(OWL.thing) || this.node.getValue().equals(RDFS.resource)) &&
            this.root && this.node.getAttribute(ResAttribute.MORE) == "1") {
            this.expandNode().subscribe();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
        if (changes['filterEnabled']) {
            this.initFilter(this.children);
        }
    }

    expandNodeImpl() {
        return this.clsService.getSubClasses(this.node.getValue(), this.showInstanceNumber).pipe(
            map(subClasses => {
                //sort by show if rendering is active, uri otherwise
                let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
                ResourceUtils.sortResources(subClasses, orderAttribute);
                this.initFilter(subClasses);
                return subClasses;
            })
        );
    }

    /**
     * Initializes (and updates when the filter enabled changes) a "filtered" attribute in each children that tells if 
     * the child is filtered by the class tree filter
     */
    private initFilter(children: AnnotatedValue<IRI>[]) {
        let classTreePref = SVContext.getProjectCtx().getProjectPreferences().classTreePreferences;
        children.forEach(c => {
            /* child filtered if:
             * - the filter is enabled
             * - the parent (current node) has a list of filtered children
             * - the child is among the filtered children
             */
            c['filtered'] = (
                this.filterEnabled &&
                classTreePref.filter.map[this.node.getValue().getIRI()] != null &&
                classTreePref.filter.map[this.node.getValue().getIRI()].indexOf(c.getValue().getIRI()) != -1
            );
        });
    }

    /**
     * The expand/collapse button in the class tree should be visible if:
     * the same condition of the other trees are satisfied 
     * (namely:
     *      - the node has "more" attribute true AND
     *          - "showDeprecated" is true (all children visible)
     *          - or "showDeprecated" is false (only not-deprecated children visible) but there is at least a child not-deprecated 
     * )
     * but in this case it should be taken into account also the sublcass filter. So it should be checked also that there should be
     * at least a child not filtered out (if filter is enabled) and not deprecated (if showDeprecated is false)
     */
    //@Override
    initShowExpandCollapseBtn() {
        let more: boolean = this.node.getAttribute(ResAttribute.MORE);
        if (more) { //if the more attribute is true, doesn't implies that the button is visible, the node children could be all deprecated
            if (this.children.length > 0) {
                let classTreeFilter: ClassTreeFilter = SVContext.getProjectCtx().getProjectPreferences().classTreePreferences.filter;
                let childVisible: boolean = false;
                /**
                 * childVisible if: 
                 * showDeprecated true, or child not-deprecated
                 * AND
                 * subClassFilter disabled or child not filtered
                 */
                for (let i = 0; i < this.children.length; i++) {
                    let childFiltered: boolean = classTreeFilter.map[this.node.getValue().getIRI()] != null &&
                        classTreeFilter.map[this.node.getValue().getIRI()].indexOf(this.children[i].getValue().getIRI()) != -1;
                    if ((this.showDeprecated || !this.children[i].isDeprecated()) && (!classTreeFilter.enabled || !childFiltered)) {
                        childVisible = true;
                        break;
                    }
                }
                this.showExpandCollapseBtn = childVisible;
            } else { //no children and "more" true means that the node has not been yet expanded, so in the doubt return true
                this.showExpandCollapseBtn = true;
            }
        } else {
            this.showExpandCollapseBtn = false;
        }

    }

}
