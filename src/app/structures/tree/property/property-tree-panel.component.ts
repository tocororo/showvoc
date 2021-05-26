import { Component, Input, ViewChild } from "@angular/core";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { SkosServices } from 'src/app/services/skos.service';
import { SVEventHandler } from 'src/app/utils/SVEventHandler';
import { SVProperties } from 'src/app/utils/SVProperties';
import { AbstractTreePanel } from '../abstract-tree-panel';
import { PropertyTreeComponent } from './property-tree.component';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';

@Component({
    selector: "property-tree-panel",
    templateUrl: "./property-tree-panel.component.html",
    host: { class: "vbox" }
})
export class PropertyTreePanelComponent extends AbstractTreePanel {
    @Input() resource: IRI;//provide to show just the properties with domain the type of the resource
    @Input() type: RDFResourceRolesEnum; //tells the type of the property to show in the tree
    @Input('roots') rootProperties: IRI[]; //in case the roots are provided to the component instead of being retrieved from server

    @ViewChild(PropertyTreeComponent) viewChildTree: PropertyTreeComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.property;
    rendering: boolean = false; //override the value in AbstractPanel

	constructor(basicModals: BasicModalsServices, eventHandler: SVEventHandler, svProp: SVProperties, private skosService: SkosServices) {
		super(basicModals, eventHandler, svProp);
    }

    //top bar commands handlers

    refresh() {
        this.viewChildTree.init();
    }

    //search handlers

    handleSearchResults(results: AnnotatedValue<IRI>[]) {
        if (results.length == 1) {
            this.openAt(results[0]);
        } else { //multiple results, ask the user which one select
            ResourceUtils.sortResources(results, this.rendering ? SortAttribute.show : SortAttribute.value);
            this.basicModals.selectResource({ key: "SEARCH.SEARCH_RESULTS" }, { key: "MESSAGES.X_SEARCH_RESOURCES_FOUND", params: { results: results.length } }, results, this.rendering).then(
                (selectedResource: AnnotatedValue<IRI>) => {
                    this.openAt(selectedResource);
                },
                () => {}
            );
        }
    }

    openAt(node: AnnotatedValue<IRI>) {
        this.viewChildTree.openTreeAt(node);
    }

}