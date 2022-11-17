import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClassTreePreference } from 'src/app/models/Properties';
import { SVProperties } from 'src/app/utils/SVProperties';
import { SVContext } from 'src/app/utils/SVContext';
import { AnnotatedValue, IRI, ResAttribute, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { ResourcesServices } from 'src/app/services/resources.service';
import { ClassesServices } from 'src/app/services/classes.service';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { BrowsingModalsServices } from 'src/app/modal-dialogs/browsing-modals/browsing-modal.service';
import { RDFS, OWL } from 'src/app/models/Vocabulary';
import { Cookie } from 'src/app/utils/Cookie';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';

@Component({
    selector: 'class-tree-settings-modal',
    templateUrl: './class-tree-settings-modal.html'
})
export class ClassTreeSettingsModal implements OnInit {

    private pristinePref: ClassTreePreference;

    rootClass: AnnotatedValue<IRI>;
    filterEnabled: boolean;

    filterMapRes: FilterMapEntry[] = [];
    selectedFilteredClass: AnnotatedValue<IRI>;

    renderingClasses: boolean = false;
    renderingFilter: boolean = false;

    showInstances: boolean;

    constructor(public activeModal: NgbActiveModal, private svProp: SVProperties,
        private clsService: ClassesServices, private resourceService: ResourcesServices,
        private basicModals: BasicModalsServices, private browsingModals: BrowsingModalsServices, 
        private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {
        let classTreePref: ClassTreePreference = SVContext.getProjectCtx().getProjectPreferences().classTreePreferences;
        this.pristinePref = JSON.parse(JSON.stringify(classTreePref));

        //init root class
        this.resourceService.getResourceDescription(new IRI(classTreePref.rootClassUri)).subscribe(
            res => {
                this.rootClass = <AnnotatedValue<IRI>>res;
            }
        );

        //init filter
        this.filterEnabled = classTreePref.filter.enabled;
        let filteredClss: IRI[] = [];
        for (let key in classTreePref.filter.map) {
            filteredClss.push(new IRI(key));
        }
        if (filteredClss.length > 0) {
            this.resourceService.getResourcesInfo(filteredClss).subscribe(
                resources => {
                    resources.forEach(r => {
                        this.filterMapRes.push({ cls: r, subClasses: null });
                    });
                }
            );
        }

        //init show instances
        this.showInstances = classTreePref.showInstancesNumber;
    }

    /**
     * ROOT CLASS HANDLERS
     */

    changeClass() {
        this.browsingModals.browseClassTree({ key: "DATA.ACTIONS.SELECT_ROOT_CLASS" }, [RDFS.resource]).then(
            (cls: AnnotatedValue<IRI>) => {
                let model: string = SVContext.getWorkingProject().getModelType();
                if (
                    (model == RDFS.uri && !cls.getValue().equals(RDFS.resource)) || //root different from rdfs:Resource in RDFS model
                    (!cls.getValue().equals(RDFS.resource) && !cls.getValue().equals(OWL.thing)) //root different from rdfs:Resource and owl:Thing in other models
                ) {
                    this.basicModals.confirmCheckCookie({ key: "COMMONS.STATUS.WARNING" }, { key: "MESSAGES.CUSTOM_ROOT_WARN" }, Cookie.WARNING_CUSTOM_ROOT, ModalType.warning).then(
                        () => {
                            this.rootClass = cls;
                        },
                        () => { }
                    );
                } else {
                    this.rootClass = cls;
                }
            },
            () => { }
        );
    }

    /**
     * Handler of root class IRI update through the input-editable widget
     * @param clsURI 
     */
    private updateRootClass(clsURI: string) {
        let cls: AnnotatedValue<IRI> = new AnnotatedValue(new IRI(clsURI), { [ResAttribute.ROLE]: RDFResourceRolesEnum.cls });
        //check if clsURI exist
        this.resourceService.getResourcePosition(cls.getValue()).subscribe(
            position => {
                if (position.isLocal()) {
                    this.rootClass = cls;
                } else {
                    this.basicModals.alert({ key: "COMMONS.STATUS.ERROR" }, { key: "MESSAGES.UNEXISTING_URI_IN_PROJECT", params: { resUri: cls.getValue().toNT() } }, ModalType.warning);
                    //temporarly reset the root class and the restore it (in order to trigger the change detection editable-input)
                    let oldRootClass = this.rootClass;
                    this.rootClass = null;
                    this.changeDetectorRef.detectChanges();
                    this.rootClass = oldRootClass;
                }
            }
        );
    }

    /**
     * FILTER MAP HANDLERS
     */

    private selectFilteredClass(cls: AnnotatedValue<IRI>) {
        this.selectedFilteredClass = cls;

        let filterMapEntry: FilterMapEntry = this.getFilterMapEntry(this.selectedFilteredClass);
        if (filterMapEntry.subClasses == null) { //subclasses yet initialized for the given class
            this.clsService.getSubClasses(this.selectedFilteredClass.getValue(), false).subscribe(
                classes => {
                    ResourceUtils.sortResources(classes, SortAttribute.show);
                    let clsTreePref: ClassTreePreference = SVContext.getProjectCtx().getProjectPreferences().classTreePreferences;
                    let filteredSubClssPref = clsTreePref.filter.map[this.selectedFilteredClass.getValue().getIRI()];

                    filterMapEntry.subClasses = [];

                    classes.forEach(c => {
                        if (filteredSubClssPref != null) { //exists a subclasses filter for the selected class
                            filterMapEntry.subClasses.push({
                                checked: filteredSubClssPref.indexOf(c.getValue().getIRI()) == -1, //subClass not in the filter, so checked (visible)
                                disabled: c.getValue().equals(OWL.thing), //owl:Thing cannot be filtered out
                                resource: c
                            });
                        } else { //doesn't exist a subclasses filter for the selected class => every subclasses is checked
                            filterMapEntry.subClasses.push({ checked: true, disabled: c.getValue().equals(OWL.thing), resource: c });
                        }
                    });
                }
            );
        }
    }

    getFilterSubClasses(): SubClassFilterItem[] {
        if (this.selectedFilteredClass != null) {
            return this.getFilterMapEntry(this.selectedFilteredClass).subClasses;
        } else {
            return [];
        }
    }

    addFilter() {
        this.browsingModals.browseClassTree({ key: "DATA.ACTIONS.SELECT_CLASS" }, [RDFS.resource]).then(
            (cls: AnnotatedValue<IRI>) => {
                if (this.getFilterMapEntry(cls) == null) {
                    this.filterMapRes.push({ cls: cls, subClasses: null });
                } else {
                    this.basicModals.alert({ key: "COMMONS.STATUS.ERROR" }, { key: "MESSAGES.CLASS_FILTER_ALREADY_EXIST", params: { cls: cls.getShow() } }, ModalType.warning);
                }
            },
            () => { }
        );
    }

    removeFilter() {
        for (let i = 0; i < this.filterMapRes.length; i++) {
            if (this.filterMapRes[i].cls.getValue().equals(this.selectedFilteredClass.getValue())) {
                this.selectedFilteredClass = null;
                this.filterMapRes.splice(i, 1);
                return;
            }
        }
    }

    checkAllClasses(checked: boolean) {
        this.getFilterMapEntry(this.selectedFilteredClass).subClasses.forEach((c: SubClassFilterItem) => {
            if (!c.disabled) {
                c.checked = checked;
            }
        });
    }

    private getFilterMapEntry(cls: AnnotatedValue<IRI>): FilterMapEntry {
        for (let i = 0; i < this.filterMapRes.length; i++) {
            if (this.filterMapRes[i].cls.getValue().equals(cls.getValue())) {
                return this.filterMapRes[i];
            }
        }
        return null;
    }


    ok() {
        //convert filterMapRes to a map string: string[]
        let filterMap: { [key: string]: string[] } = {};
        this.filterMapRes.forEach(f => {
            let filteredSubClasses: string[] = [];
            if (f.subClasses == null) {
                //subClasses in filterMapRes not yet initialized => get it from the preference
                filteredSubClasses = SVContext.getProjectCtx().getProjectPreferences().classTreePreferences.filter.map[f.cls.getValue().getIRI()];
            } else {
                for (let i = 0; i < f.subClasses.length; i++) {
                    if (!f.subClasses[i].checked) {
                        filteredSubClasses.push(f.subClasses[i].resource.getValue().getIRI());
                    }
                }
            }
            filterMap[f.cls.getValue().getIRI()] = filteredSubClasses;
        });

        //update the settings only if changed
        if (
            JSON.stringify(this.pristinePref.filter.map) != JSON.stringify(filterMap) ||
            this.pristinePref.filter.enabled != this.filterEnabled
        ) {
            this.svProp.setClassTreeFilter({ map: filterMap, enabled: this.filterEnabled });
        }

        console.log(this.pristinePref.rootClassUri, this.rootClass.getValue().getIRI());
        if (this.pristinePref.rootClassUri != this.rootClass.getValue().getIRI()) {
            this.svProp.setClassTreeRoot(this.rootClass.getValue().getIRI());
        }

        if (this.pristinePref.showInstancesNumber != this.showInstances) {
            this.svProp.setClassTreeShowInstances(this.showInstances);
        }

        //only if the root class changed close the dialog (so that the class tree refresh)
        if (this.pristinePref.rootClassUri != this.rootClass.getValue().getIRI()) {
            this.activeModal.close();
        } else { //for other changes simply dismiss the modal
            this.close();
        }
    }

    close() {
        this.activeModal.dismiss();
    }

}


class FilterMapEntry {
    cls: AnnotatedValue<IRI>;
    subClasses: SubClassFilterItem[];
}

class SubClassFilterItem {
    checked: boolean;
    resource: AnnotatedValue<IRI>;
    disabled?: boolean;
}