import { Component, Input, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ConceptTreeVisualizationMode } from 'src/app/models/Properties';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { SearchServices } from 'src/app/services/search.service';
import { SkosServices } from 'src/app/services/skos.service';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractTree } from '../abstract-tree';
import { ConceptTreeNodeComponent } from './concept-tree-node.component';

@Component({
    selector: 'concept-tree',
    templateUrl: './concept-tree.component.html',
    host: { class: "structureComponent" }
})
export class ConceptTreeComponent extends AbstractTree {

    @Input() schemes: IRI[];

    @ViewChildren(ConceptTreeNodeComponent) viewChildrenNode: QueryList<ConceptTreeNodeComponent>;

    constructor(private skosService: SkosServices, private searchService: SearchServices, private pmkiProp: PMKIProperties, 
        eventHandler: PMKIEventHandler, basicModals: BasicModalsServices) {
        super(eventHandler, basicModals);
    }

    /**
     * Listener on changes of @Input scheme. When it changes, update the tree
     */
    ngOnChanges(changes: SimpleChanges) {
        if (changes['schemes']) {
            this.init();
        }
    }

    initImpl() {
        if (this.pmkiProp.getConceptTreePreferences().visualization == ConceptTreeVisualizationMode.hierarchyBased) {
            this.loading = true;
            this.skosService.getTopConcepts(this.schemes).subscribe(
                concepts => {
                    this.loading = false;
                    let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
                    ResourceUtils.sortResources(concepts, orderAttribute);
                    this.nodes = concepts;

                    if (this.pendingSearchPath) {
                        this.expandPath(this.pendingSearchPath);
                    }
                }
            );
        } else if (this.pmkiProp.getConceptTreePreferences().visualization == ConceptTreeVisualizationMode.searchBased) {
            //don't do nothing
        }
    }

    openTreeAt(node: AnnotatedValue<IRI>) {
        this.searchService.getPathFromRoot(node.getValue(), RDFResourceRolesEnum.concept, this.schemes).subscribe(
            path => {
                if (path.length == 0) {
                    this.onTreeNodeNotReachable(node);
                };
                //open tree from root to node
                this.expandPath(path);
            }
        );
    }

    public forceList(list: AnnotatedValue<IRI>[]) {
        this.setInitialStatus();
        this.nodes = list;
    }

}
