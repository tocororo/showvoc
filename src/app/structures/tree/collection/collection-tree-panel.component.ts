import { Component, ViewChild } from "@angular/core";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { SVEventHandler } from 'src/app/utils/SVEventHandler';
import { SVProperties } from 'src/app/utils/SVProperties';
import { AbstractTreePanel } from '../abstract-tree-panel';
import { CollectionTreeComponent } from './collection-tree.component';

@Component({
    selector: "collection-tree-panel",
    templateUrl: "./collection-tree-panel.component.html",
    host: { class: "vbox" }
})
export class CollectionTreePanelComponent extends AbstractTreePanel {
    @ViewChild(CollectionTreeComponent) viewChildTree: CollectionTreeComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.skosCollection;

    constructor(basicModals: BasicModalsServices, sharedModals: SharedModalsServices, eventHandler: SVEventHandler, svProp: SVProperties) {
        super(basicModals, sharedModals, eventHandler, svProp);
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
            this.sharedModals.selectResource({ key: "SEARCH.SEARCH_RESULTS" }, { key: "MESSAGES.X_SEARCH_RESOURCES_FOUND", params: { results: results.length } }, results, this.rendering).then(
                (selectedResources: AnnotatedValue<IRI>[]) => {
                    this.openAt(selectedResources[0]);
                },
                () => { }
            );
        }
    }

    openAt(node: AnnotatedValue<IRI>) {
        this.viewChildTree.openTreeAt(node);
    }

}