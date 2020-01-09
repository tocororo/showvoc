import { Component, Input, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { ConceptTreePreference, ConceptTreeVisualizationMode } from 'src/app/models/Properties';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { SearchServices } from 'src/app/services/search.service';
import { SkosServices } from 'src/app/services/skos.service';
import { PMKIContext } from 'src/app/utils/PMKIContext';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
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

    structRole: RDFResourceRolesEnum = RDFResourceRolesEnum.concept;

    private lastTimeInit: number;

    constructor(private skosService: SkosServices, searchService: SearchServices,
        eventHandler: PMKIEventHandler, basicModals: BasicModalsServices, sharedModals: SharedModalsServices) {
        super(eventHandler, searchService, basicModals, sharedModals);
    }

    /**
     * Listener on changes of @Input scheme. When it changes, update the tree
     */
    ngOnChanges(changes: SimpleChanges) {
        /**
         * Initialized the tree only if not the first change. Avoid multiple initialization.
         * The first initialization was already fired in ngOnInit of AbstractStructure
         */
        if (changes['schemes'] && !changes['schemes'].isFirstChange()) { 
            this.init();
        }
    }

    initImpl() {
        let conceptTreePref: ConceptTreePreference = PMKIContext.getProjectCtx().getProjectPreferences().conceptTreePreferences;
        if (conceptTreePref.visualization == ConceptTreeVisualizationMode.hierarchyBased) {
            this.loading = true;
            this.lastTimeInit = new Date().getTime();
            this.skosService.getTopConcepts(this.lastTimeInit, this.schemes).pipe(
                finalize(() => this.loading = false)
            ).subscribe(
                data => {
                    if (data.timestamp != this.lastTimeInit) return;
                    let topConcepts = data.concepts;
                    let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
                    ResourceUtils.sortResources(topConcepts, orderAttribute);
                    this.nodes = topConcepts;

                    if (this.pendingSearchPath) {
                        this.expandPath(this.pendingSearchPath);
                    }
                }
            );
        } else if (conceptTreePref.visualization == ConceptTreeVisualizationMode.searchBased) {
            //don't do nothing
        }
    }

    public forceList(list: AnnotatedValue<IRI>[]) {
        this.setInitialStatus();
        this.nodes = list;
    }

}
