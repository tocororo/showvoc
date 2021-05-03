import { Component, EventEmitter, Input, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { Observable, of } from 'rxjs';
import { finalize, mergeMap } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { ConceptTreePreference, ConceptTreeVisualizationMode, SafeToGo, SafeToGoMap } from 'src/app/models/Properties';
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
    @Output() requireSettings = new EventEmitter<void>(); //requires to the parent panel to open/change settings

    @ViewChildren(ConceptTreeNodeComponent) viewChildrenNode: QueryList<ConceptTreeNodeComponent>;

    structRole: RDFResourceRolesEnum = RDFResourceRolesEnum.concept;

    safeToGoLimit: number;
    safeToGo: SafeToGo = { safe: true };

    private lastTimeInit: number;

    visualizationMode: ConceptTreeVisualizationMode;//this could be changed dynamically, so each time it is used, get it again from preferences

    translationParam: { elemCount: number, safeToGoLimit: number };

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
        this.visualizationMode = PMKIContext.getProjectCtx().getProjectPreferences().conceptTreePreferences.visualization;
        if (this.visualizationMode == ConceptTreeVisualizationMode.hierarchyBased) {
            this.checkInitializationSafe().subscribe(
                () => {
                    if (this.safeToGo.safe) {
                        this.lastTimeInit = new Date().getTime();
                        this.loading = true;
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
                    }
                }
            )
        } else if (this.visualizationMode == ConceptTreeVisualizationMode.searchBased) {
            //don't do nothing
        }
    }

    /**
     * Forces the safeness of the structure even if it was reported as not safe, then re initialize it
     */
    forceSafeness() {
        this.safeToGo.safe = true;
        let conceptTreePreference: ConceptTreePreference = PMKIContext.getProjectCtx().getProjectPreferences().conceptTreePreferences;
        let safeToGoMap: SafeToGoMap = conceptTreePreference.safeToGoMap;
        let checksum = this.getInitRequestChecksum();
        safeToGoMap[checksum] = this.safeToGo;
        this.initImpl();
    }

    /**
     * Perform a check in order to prevent the initialization of the structure with too many elements.
     * Return true if the initialization is safe or if the user agreed to init the structure anyway
     */
    private checkInitializationSafe(): Observable<void> {
        let conceptTreePreference: ConceptTreePreference = PMKIContext.getProjectCtx().getProjectPreferences().conceptTreePreferences;
        let safeToGoMap: SafeToGoMap = conceptTreePreference.safeToGoMap;
        this.safeToGoLimit = conceptTreePreference.safeToGoLimit;

        let checksum = this.getInitRequestChecksum();

        let safeness: SafeToGo = safeToGoMap[checksum];
        if (safeness != null) { //found safeness in cache
            this.safeToGo = safeness;
            return of(null)
        } else { //never initialized => count
            this.loading = true;
            return this.skosService.countTopConcepts(this.schemes).pipe(
                mergeMap(count => {
                    this.loading = false;
                    safeness = { safe: count < this.safeToGoLimit, count: count };
                    safeToGoMap[checksum] = safeness; //cache the safetyness
                    this.safeToGo = safeness;
                    this.translationParam = { elemCount: this.safeToGo.count, safeToGoLimit: this.safeToGoLimit };
                    return of(null)
                })
            );
        }
    }

    private getInitRequestChecksum() {
        let checksum = "schemes:" + this.schemes.map(s => s.toNT()).join(",");
        return checksum;
    }

    public forceList(list: AnnotatedValue<IRI>[]) {
        this.setInitialStatus();
        this.nodes = list;
    }

}
