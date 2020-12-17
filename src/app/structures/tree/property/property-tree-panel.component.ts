import { Component, Input, ViewChild } from "@angular/core";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { SkosServices } from 'src/app/services/skos.service';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
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

	constructor(basicModals: BasicModalsServices, eventHandler: PMKIEventHandler, pmkiProp: PMKIProperties, private skosService: SkosServices) {
		super(basicModals, eventHandler, pmkiProp);
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
            this.basicModals.selectResource("SEARCH.SEARCH_RESULTS", results.length + " results found.", results, this.rendering).then(
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