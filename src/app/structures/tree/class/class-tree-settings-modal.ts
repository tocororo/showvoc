import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClassTreePreference } from 'src/app/models/Properties';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { PMKIContext } from 'src/app/utils/PMKIContext';
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

    private rootClass: AnnotatedValue<IRI>;
    private filterEnabled: boolean;

    private filterMapRes: FilterMapEntry[] = [];
    private selectedFilteredClass: AnnotatedValue<IRI>;

    private renderingClasses: boolean = false;
    private renderingFilter: boolean = false;

    showInstances: boolean;

    constructor(public activeModal: NgbActiveModal, private pmkiProp: PMKIProperties,
        private clsService: ClassesServices, private resourceService: ResourcesServices, 
        private basicModals: BasicModalsServices, private browsingModals: BrowsingModalsServices) {}

    ngOnInit() {
        let classTreePref: ClassTreePreference = PMKIContext.getProjectCtx().getProjectPreferences().classTreePreferences;
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
        for (var key in classTreePref.filter.map) {
            filteredClss.push(new IRI(key));
        }
        if (filteredClss.length > 0) {
            this.resourceService.getResourcesInfo(filteredClss).subscribe(
                resources => {
                    resources.forEach(r => {
                        this.filterMapRes.push({ cls: r, subClasses: null });
                    })
                }
            )
        }

        //init show instances
        this.showInstances = classTreePref.showInstancesNumber;
    }

    /**
     * ROOT CLASS HANDLERS
     */

    private changeClass() {
        this.browsingModals.browseClassTree("Select root class", [RDFS.resource]).then(
            (cls: AnnotatedValue<IRI>) => {
                if (Cookie.getCookie(Cookie.WARNING_CUSTOM_ROOT) != "false") {
                    let model: string = PMKIContext.getWorkingProject().getModelType();
                    if ((model == RDFS.uri && !cls.getValue().equals(RDFS.resource)) ||
                        (!cls.getValue().equals(RDFS.resource) && !cls.getValue().equals(OWL.thing)) //OWL or RDFS model
                    ) {
                        let message: string = "Selecting a specific class as a root could hide newly created classes " + 
                            "that are not subclasses of the chosen root.";
                        this.basicModals.alert("Warning", message, ModalType.warning, null, "Don't show this again").then(
                            checked => {
                                if (checked) {
                                    Cookie.setCookie(Cookie.WARNING_CUSTOM_ROOT, "false");
                                }
                            }
                        )
                    }
                }
                this.rootClass = cls;
            },
            () => {}
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
                    this.basicModals.alert("Error", "Wrong URI: no resource with URI " + cls.getValue().toNT() + " exists in the current project", ModalType.warning);
                    //temporarly reset the root class and the restore it (in order to trigger the change detection editable-input)
                    let oldRootClass = this.rootClass;
                    this.rootClass = null;
                    setTimeout(() => this.rootClass = oldRootClass);
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
                    let clsTreePref: ClassTreePreference = PMKIContext.getProjectCtx().getProjectPreferences().classTreePreferences;
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

    private getFilterSubClasses(): SubClassFilterItem[] {
        if (this.selectedFilteredClass != null) {
            return this.getFilterMapEntry(this.selectedFilteredClass).subClasses;
        } else {
            return [];
        }
    }

    private addFilter() {
        this.browsingModals.browseClassTree("Select class", [RDFS.resource]).then(
            (cls: AnnotatedValue<IRI>) => {
                if (this.getFilterMapEntry(cls) == null) {
                    this.filterMapRes.push({ cls: cls, subClasses: null });
                } else {
                    this.basicModals.alert("Error", "A filter for class " + cls.getShow() + " already exists.", ModalType.warning);
                }
            },
            () => {}
        );
    }

    private removeFilter() {
        for (var i = 0; i < this.filterMapRes.length; i++) {
            if (this.filterMapRes[i].cls.getValue().equals(this.selectedFilteredClass.getValue())) {
                this.selectedFilteredClass = null;
                this.filterMapRes.splice(i, 1);
                return;
            }
        }
    }

    private checkAllClasses(checked: boolean) {
        this.getFilterMapEntry(this.selectedFilteredClass).subClasses.forEach((c: SubClassFilterItem) => {
            if (!c.disabled) {
                c.checked = checked;
            }
        });
    }

    private getFilterMapEntry(cls: AnnotatedValue<IRI>): FilterMapEntry {
        for (var i = 0; i < this.filterMapRes.length; i++) {
            if (this.filterMapRes[i].cls.getValue().equals(cls.getValue())) {
                return this.filterMapRes[i];
            }
        }
        return null;
    }



	ok() {
        //convert filterMapRes to a map string: string[]
        let filterMap: {[key: string]: string[]} = {};
        this.filterMapRes.forEach(f => {
            let filteredSubClasses: string[] = [];
            if (f.subClasses == null) {
                //subClasses in filterMapRes not yet initialized => get it from the preference
                filteredSubClasses = PMKIContext.getProjectCtx().getProjectPreferences().classTreePreferences.filter.map[f.cls.getValue().getIRI()];
            } else {
                for (var i = 0; i < f.subClasses.length; i++) {
                    if (!f.subClasses[i].checked) {
                        filteredSubClasses.push(f.subClasses[i].resource.getValue().getIRI());
                    }
                }
            }
            filterMap[f.cls.getValue().getIRI()] = filteredSubClasses;
        })
        
        //update the settings only if changed
        if (
            JSON.stringify(this.pristinePref.filter.map) != JSON.stringify(filterMap) ||
            this.pristinePref.filter.enabled != this.filterEnabled
        ) {
            this.pmkiProp.setClassTreeFilter({ map: filterMap, enabled: this.filterEnabled })
        }

        if (this.pristinePref.rootClassUri != this.rootClass.getValue().getIRI()) {
            this.pmkiProp.setClassTreeRoot(this.rootClass.getValue().getIRI());
        }

        if (this.pristinePref.showInstancesNumber != this.showInstances) {
            this.pmkiProp.setClassTreeShowInstances(this.showInstances);
        }

        //only if the root class changed close the dialog (so that the class tree refresh)
        if (this.pristinePref.rootClassUri != this.rootClass.getValue().getIRI()) {
            this.activeModal.close();
        } else {//for other changes simply dismiss the modal
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