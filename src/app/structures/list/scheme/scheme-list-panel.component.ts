import { Component, ViewChild } from "@angular/core";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { SVEventHandler } from 'src/app/utils/SVEventHandler';
import { SVProperties } from 'src/app/utils/SVProperties';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractListPanel } from '../abstract-list-panel';
import { SchemeListComponent } from './scheme-list.component';

@Component({
    selector: "scheme-list-panel",
    templateUrl: "./scheme-list-panel.component.html",
    host: { class: "vbox" }
})
export class SchemeListPanelComponent extends AbstractListPanel {
    @ViewChild(SchemeListComponent) viewChildList: SchemeListComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.conceptScheme;

    constructor(basicModals: BasicModalsServices, eventHandler: SVEventHandler, svProp: SVProperties) {
        super(basicModals, eventHandler, svProp);
    }

    handleSearchResults(results: AnnotatedValue<IRI>[]) {
        if (results.length == 1) {
            this.openAt(results[0]);
        } else { //multiple results, ask the user which one select
            ResourceUtils.sortResources(results, this.rendering ? SortAttribute.show : SortAttribute.value);
            this.basicModals.selectResource({ key: "SEARCH.SEARCH_RESULTS" }, { key: "MESSAGES.X_SEARCH_RESOURCES_FOUND", params: { results: results.length } }, results, this.rendering).then(
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

    activateAllScheme() {
        this.viewChildList.activateAllScheme();
    }
    deactivateAllScheme() {
        this.viewChildList.deactivateAllScheme();
    }

    refresh() {
        this.viewChildList.init();
    }

}