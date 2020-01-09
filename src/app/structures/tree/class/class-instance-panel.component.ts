import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { AnnotatedValue, IRI, RDFResourceRolesEnum, ResAttribute } from 'src/app/models/Resources';
import { TreeListContext } from 'src/app/utils/UIUtils';
import { InstanceListPanelComponent } from '../../list/instance/instance-list-panel.component';
import { ClassTreePanelComponent } from './class-tree-panel.component';
import { IndividualsServices } from 'src/app/services/individuals.service';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';

/**
 * While classTreeComponent has as @Input rootClasses this componente cannot
 * because if it allows multiple roots, when the user wants to add a class (not a sublcass)
 * I don't know wich class consider as superClass of the new added class
 */

@Component({
    selector: "class-instance-panel",
    templateUrl: "./class-instance-panel.component.html",
    host: { class: "vbox" }
})
export class ClassInstancePanelComponent {
    @Input() context: TreeListContext;

    @Output() nodeSelected = new EventEmitter<AnnotatedValue<IRI>>();

    @ViewChild(ClassTreePanelComponent) viewChildClassTree: ClassTreePanelComponent;
    @ViewChild(InstanceListPanelComponent) viewChildInstanceList: InstanceListPanelComponent;

    private rendering: boolean = false; //if true the nodes in the tree should be rendered with the show, with the qname otherwise

    selectedClass: AnnotatedValue<IRI> = null;
    selectedInstance: AnnotatedValue<IRI>;

    panelRole: RDFResourceRolesEnum[] = [RDFResourceRolesEnum.cls, RDFResourceRolesEnum.individual];

    constructor(private individualService: IndividualsServices, private basicModals: BasicModalsServices) {}

    handleSearchResults(results: AnnotatedValue<IRI>[]) {
        if (results.length == 1) {
            this.selectSearchedResource(results[0]);
        } else { //multiple results, ask the user which one select
            ResourceUtils.sortResources(results, this.rendering ? SortAttribute.show : SortAttribute.value);
            this.basicModals.selectResource("Search results", results.length + " results found.", results, this.rendering).then(
                (selectedResource: AnnotatedValue<IRI>) => {
                    this.selectSearchedResource(selectedResource);
                },
                () => {}
            );
        }
    }

    /**
     * If resource is a class expands the class tree and select the resource,
     * otherwise (resource is an instance) expands the class tree to the class of the instance and
     * select the instance in the instance list
     */
    public selectSearchedResource(resource: AnnotatedValue<IRI>) {
        if (resource.getRole() == RDFResourceRolesEnum.cls) {
            this.viewChildClassTree.openAt(resource);
        } else { // resource is an instance
            //get type of instance, then open the tree to that class
            this.individualService.getNamedTypes(resource.getValue()).subscribe(
                types => {
                    this.viewChildClassTree.openAt(types[0]);
                    //center instanceList to the individual
                    this.viewChildInstanceList.openAt(resource);
                }
            )
        }
    }

    //EVENT LISTENERS
    onClassSelected(cls: AnnotatedValue<IRI>) {
        this.selectedClass = cls;
        if (this.selectedInstance != null) {
            this.selectedInstance.setAttribute(ResAttribute.SELECTED, false);
            this.selectedInstance = null;
        }
        if (cls != null) { //cls could be null if the underlaying classTree has been refreshed
            // this.classSelected.emit(cls);
            this.nodeSelected.emit(cls);
        }
    }

    onInstanceSelected(instance: AnnotatedValue<IRI>) {
        this.selectedInstance = instance;
        //event could be fired after a refresh on the list, in that case, instance is null
        if (instance != null) { //forward the event only if instance is not null
            // this.instanceSelected.emit(instance);
            this.nodeSelected.emit(instance);
        }
    }

}