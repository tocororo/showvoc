import { Component, Input, ViewChild } from "@angular/core";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { AbstractListPanel } from '../abstract-list-panel';
import { LexiconListComponent } from './lexicon-list.component';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';

@Component({
    selector: "lexicon-list-panel",
    templateUrl: "./lexicon-list-panel.component.html",
    host: { class: "vbox" }
})
export class LexiconListPanelComponent extends AbstractListPanel {
    @ViewChild(LexiconListComponent) viewChildList: LexiconListComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.limeLexicon;

    constructor(basicModals: BasicModalsServices, eventHandler: PMKIEventHandler, vbProp: PMKIProperties) {
        super(basicModals, eventHandler, vbProp);
    }

    handleSearchResults(results: AnnotatedValue<IRI>[]) {
        if (results.length == 1) {
            this.openAt(results[0]);
        } else { //multiple results, ask the user which one select
            ResourceUtils.sortResources(results, this.rendering ? SortAttribute.show : SortAttribute.value);
            this.basicModals.selectResource("Search results", results.length + " results found.", results, this.rendering).then(
                (selectedResource: AnnotatedValue<IRI>) => {
                    this.openAt(selectedResource);
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