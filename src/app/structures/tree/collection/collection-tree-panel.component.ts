import { Component, ViewChild } from "@angular/core";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { SkosServices } from 'src/app/services/skos.service';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { AbstractTreePanel } from '../abstract-tree-panel';
import { CollectionTreeComponent } from './collection-tree.component';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';

@Component({
    selector: "collection-tree-panel",
    templateUrl: "./collection-tree-panel.component.html",
    host: { class: "vbox" }
})
export class CollectionTreePanelComponent extends AbstractTreePanel {
    @ViewChild(CollectionTreeComponent) viewChildTree: CollectionTreeComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.skosCollection;

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
            this.openTreeAt(results[0]);
        } else { //multiple results, ask the user which one select
            ResourceUtils.sortResources(results, this.rendering ? SortAttribute.show : SortAttribute.value);
            this.basicModals.selectResource("Search results", results.length + " results found.", results, this.rendering).then(
                (selectedResource: AnnotatedValue<IRI>) => {
                    this.openTreeAt(selectedResource);
                },
                () => {}
            );
        }
    }

    openTreeAt(resource: AnnotatedValue<IRI>) {
        this.viewChildTree.openTreeAt(resource);
    }

}