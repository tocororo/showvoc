import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
import { finalize, mergeMap } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { InstanceListPreference, InstanceListVisualizationMode, SafeToGo, SafeToGoMap } from 'src/app/models/Properties';
import { AnnotatedValue, IRI, RDFResourceRolesEnum, ResAttribute } from 'src/app/models/Resources';
import { ClassesServices } from 'src/app/services/classes.service';
import { SVContext } from 'src/app/utils/SVContext';
import { SVEventHandler } from 'src/app/utils/SVEventHandler';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractList } from '../abstract-list';

@Component({
    selector: 'instance-list',
    templateUrl: './instance-list.component.html',
    host: { class: "structureComponent" }
})
export class InstanceListComponent extends AbstractList {
    @Input() cls: AnnotatedValue<IRI>;
    @Output() requireSettings = new EventEmitter<void>(); //requires to the parent panel to open/change settings

    structRole: RDFResourceRolesEnum = RDFResourceRolesEnum.conceptScheme;

    private pendingSearchCls: IRI; //class of a searched instance that is waiting to be selected once the list is initialized

    visualizationMode: InstanceListVisualizationMode;//this could be changed dynamically, so each time it is used, get it again from preferences

    private safeToGoLimit: number;
    safeToGo: SafeToGo = { safe: true };

    translationParam: { count: number, safeToGoLimit: number };

    constructor(private clsService: ClassesServices, private basicModals: BasicModalsServices, eventHandler: SVEventHandler) {
        super(eventHandler);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['cls'] && changes['cls'].currentValue) {
            this.init();
        }
    }

    initImpl() {
        this.visualizationMode = SVContext.getProjectCtx().getProjectPreferences().instanceListPreferences.visualization;
        if (this.cls != null) { //class provided => init list
            if (this.visualizationMode == InstanceListVisualizationMode.standard) {
                this.checkInitializationSafe().subscribe(
                    () => {
                        if (this.safeToGo.safe) {
                            this.loading = true;
                            this.clsService.getInstances(this.cls.getValue()).pipe(
                                finalize(() => { this.loading = false; })
                            ).subscribe(
                                instances => {
                                    let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
                                    ResourceUtils.sortResources(instances, orderAttribute);
                                    this.nodes = <AnnotatedValue<IRI>[]>instances; //TODO remove cast and find another solution since instances could be also bnode
                                    this.resumePendingSearch();
                                }
                            );
                        }
                    }
                );
            } else { //search based
                //don't do nothing, just check for pending search
                this.resumePendingSearch();
            }
        } else { //class not provided, reset the instance list
            //setTimeout prevent ExpressionChangedAfterItHasBeenCheckedError on isOpenGraphEnabled('dataOriented') in the parent panel
            setTimeout(() => {
                this.setInitialStatus();
            });
        }
    }

    private resumePendingSearch() {
        // if there is some pending search where the class is same class which instance are currently described
        if (
            this.pendingSearchRes &&
            (
                (this.pendingSearchCls && this.cls.getValue() && this.pendingSearchCls.equals(this.cls.getValue())) ||
                !this.pendingSearchCls //null if already checked that the pendingSearchCls is the current (see selectSearchedInstance)
            )
        ) {
            if (SVContext.getProjectCtx().getProjectPreferences().instanceListPreferences.visualization == InstanceListVisualizationMode.standard) {
                this.openListAt(this.pendingSearchRes); //standard mode => simply open list (focus searched res)
            } else { //search mode => set the pending searched resource as only element of the list and then focus it
                this.forceList([this.pendingSearchRes]);
                setTimeout(() => {
                    this.openListAt(this.pendingSearchRes);
                });
            }
        }
    }

    public forceList(list: AnnotatedValue<IRI>[]) {
        this.setInitialStatus();
        this.nodes = list;
    }

    /**
     * Perform a check in order to prevent the initialization of the structure with too many elements
     * Return true if the initialization is safe or if the user agreed to init the structure anyway
     */
    private checkInitializationSafe(): Observable<void> {
        let instListPreference: InstanceListPreference = SVContext.getProjectCtx().getProjectPreferences().instanceListPreferences;
        let safeToGoMap: SafeToGoMap = instListPreference.safeToGoMap;
        this.safeToGoLimit = instListPreference.safeToGoLimit;

        let checksum = this.getInitRequestChecksum();

        let safeness: SafeToGo = safeToGoMap[checksum];
        if (safeness != null) { //found safeness in cache
            this.safeToGo = safeness;
            return of(null);
        } else { //never initialized => count
            return this.getNumberOfInstances(this.cls.getValue()).pipe(
                mergeMap(count => {
                    safeness = { safe: count < this.safeToGoLimit, count: count };
                    safeToGoMap[checksum] = safeness; //cache the safeness
                    this.safeToGo = safeness;
                    this.translationParam = { count: this.safeToGo.count, safeToGoLimit: this.safeToGoLimit };
                    return of(null);
                })
            );
        }
    }

    private getInitRequestChecksum() {
        let checksum = "cls:" + this.cls.getValue().toNT();
        return checksum;
    }

    /**
     * Forces the safeness of the structure even if it was reported as not safe, then re initialize it
     */
    private forceSafeness() {
        this.safeToGo = { safe: true };
        let instListPreference: InstanceListPreference = SVContext.getProjectCtx().getProjectPreferences().instanceListPreferences;
        let safeToGoMap: SafeToGoMap = instListPreference.safeToGoMap;
        let checksum = this.getInitRequestChecksum();
        safeToGoMap[checksum] = this.safeToGo;
        this.initImpl();
    }

    /**
     * Returns the number of instances of the given class. Useful when the user select a class in order to check if there 
     * are too many instances.
     * @param cls 
     */
    private getNumberOfInstances(cls: IRI): Observable<number> {
        if (SVContext.getProjectCtx().getProjectPreferences().classTreePreferences.showInstancesNumber) { //if num inst are already computed when building the tree...
            return of(this.cls.getAttribute(ResAttribute.NUM_INST));
        } else { //otherwise call a service
            return this.clsService.getNumberOfInstances(cls);
        }
    }

}
