import { Component, Input, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { finalize, flatMap } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { ConceptTreePreference, ConceptTreeVisualizationMode, SafeToGoMap } from 'src/app/models/Properties';
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

    private safeToGoLimit: number = 1000;

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
            this.checkInitializationSafe().subscribe(
                proceed => {
                    if (proceed) {
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
                    }
                }
            )
        } else if (conceptTreePref.visualization == ConceptTreeVisualizationMode.searchBased) {
            //don't do nothing
        }
    }

    /**
     * Perform a check in order to prevent the initialization of the structure with too many elements.
     * Return true if the initialization is safe or if the user agreed to init the structure anyway
     */
    private checkInitializationSafe(): Observable<boolean> {
        let conceptTreePreference: ConceptTreePreference = PMKIContext.getProjectCtx().getProjectPreferences().conceptTreePreferences;
        let safeToGoMap: SafeToGoMap = conceptTreePreference.safeToGoMap;

        let unsafetyMessage = "The concept tree has a large amount of top concepts. " + 
            "Retrieving them all could be a long process, you might experience performance decrease or it might even hang the system. " + 
            "It is highly recommended to switch from 'hierarchy' to 'search-based' visualization mode from the tree settings.\n" + 
            "Do you want to force the tree initialization anyway?";

        let checksum = "schemes:" + this.schemes.map(s => s.toNT()).join(",");

        let safe: boolean = safeToGoMap[checksum];
        if (safe === true) { //cached to be safe => allow the initalization
            return of(true)
        } else if (safe === false) { //cached to be not safe => warn the user
            return from(
                this.basicModals.confirm("Concept tree", unsafetyMessage, ModalType.warning).then(
                    () => { return true; },
                    () => { return false; }
                )
            );
        } else { //never initialized => count
            this.loading = true;
            return this.skosService.countTopConcepts(this.schemes).pipe(
                finalize(() => this.loading = false),
                flatMap(count => {
                    safe = count < this.safeToGoLimit;
                    safeToGoMap[checksum] = safe; //cache the safetyness
                    if (safe) { //safe => proceed
                        return of(true);
                    } else { //limit exceeded, not safe => warn the user
                        this.basicModals.confirm("Concept tree", unsafetyMessage, ModalType.warning).then(
                            () => { return true; },
                            () => { return false; }
                        )
                    }
                })
            );
        }
    }

    public forceList(list: AnnotatedValue<IRI>[]) {
        this.setInitialStatus();
        this.nodes = list;
    }

}
