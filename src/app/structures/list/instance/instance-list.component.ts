import { Component, Input, SimpleChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { AnnotatedValue, IRI, RDFResourceRolesEnum, ResAttribute } from 'src/app/models/Resources';
import { ClassesServices } from 'src/app/services/classes.service';
import { PMKIContext } from 'src/app/utils/PMKIContext';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractList } from '../abstract-list';

@Component({
    selector: 'instance-list',
    templateUrl: './instance-list.component.html',
    host: { class: "structureComponent" }
})
export class InstanceListComponent extends AbstractList {

    @Input() cls: AnnotatedValue<IRI>;

    structRole: RDFResourceRolesEnum = RDFResourceRolesEnum.conceptScheme;

    private instanceLimit: number = 10000;

    constructor(private clsService: ClassesServices, private basicModals: BasicModalsServices, eventHandler: PMKIEventHandler) {
        super(eventHandler);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['cls'] && changes['cls'].currentValue) {
            this.getNumberOfInstances(this.cls.getValue()).subscribe(
                numInst => {
                    if (numInst > this.instanceLimit) {
                        this.basicModals.confirm("DATA.INSTANCE.UNSAFE_WARN.TOO_MUCH_INST", "Warning: the selected class (" + this.cls.getShow() 
                            + ") has too many instances (" + numInst + "). Retrieving them all could be a very long process "
                            + "and it may slow down the server. Do you want to continue anyway?", ModalType.warning).then(
                            () => {
                                this.init();
                            },
                            () =>  {
                                this.nodes = [];
                            }
                        );
                    } else {
                        this.init();
                    }
                }
            );
        }
    }

    initImpl() {
        if (this.cls != undefined) {
            this.loading = true;
            this.clsService.getInstances(this.cls.getValue()).pipe(
                finalize(() => this.loading = false)
            ).subscribe(
                instances => {
                    let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
                    ResourceUtils.sortResources(instances, orderAttribute);
                    this.nodes = <AnnotatedValue<IRI>[]>instances; //TODO remove cast and find another solution since instances could be also bnode
                    //if there is some pending search
                    if (this.pendingSearchRes) {
                        this.openListAt(this.pendingSearchRes);
                    }
                }
            );
        }
    }

    /**
     * Returns the number of instances of the given class. Useful when the user select a class in order to check if there 
     * are too many instances.
     * @param cls 
     */
    private getNumberOfInstances(cls: IRI): Observable<number> {
        if (PMKIContext.getProjectCtx().getProjectPreferences().classTreePreferences.showInstancesNumber) { //if num inst are already computed when building the tree...
            return of(this.cls.getAttribute(ResAttribute.NUM_INST));
        } else { //otherwise call a service
            return this.clsService.getNumberOfInstances(cls);
        }
    }

}
