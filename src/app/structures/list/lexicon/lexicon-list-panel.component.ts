import { Component, ViewChild } from "@angular/core";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { SVEventHandler } from 'src/app/utils/SVEventHandler';
import { SVProperties } from 'src/app/utils/SVProperties';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractListPanel } from '../abstract-list-panel';
import { LexiconListComponent } from './lexicon-list.component';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';

@Component({
    selector: "lexicon-list-panel",
    templateUrl: "./lexicon-list-panel.component.html",
    host: { class: "vbox" }
})
export class LexiconListPanelComponent extends AbstractListPanel {
    @ViewChild(LexiconListComponent) viewChildList: LexiconListComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.limeLexicon;

    constructor(basicModals: BasicModalsServices, sharedModals: SharedModalsServices, eventHandler: SVEventHandler, svProp: SVProperties) {
        super(basicModals, sharedModals, eventHandler, svProp);
    }

    handleSearchResults(results: AnnotatedValue<IRI>[]) {
        if (results.length == 1) {
            this.openAt(results[0]);
        } else { //multiple results, ask the user which one select
            ResourceUtils.sortResources(results, this.rendering ? SortAttribute.show : SortAttribute.value);
            this.sharedModals.selectResource({ key: "SEARCH.SEARCH_RESULTS" }, { key: "MESSAGES.X_SEARCH_RESOURCES_FOUND", params: { results: results.length } }, results, this.rendering).then(
                (selectedResources: AnnotatedValue<IRI>[]) => {
                    this.openAt(selectedResources[0]);
                },
                () => {}
            );
        }
    }

    public openAt(node: AnnotatedValue<IRI>) {
        this.viewChildList.openListAt(node);
    }

    refresh() {
        this.viewChildList.init();
    }

}