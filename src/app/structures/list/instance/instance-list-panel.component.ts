import { Component, ViewChild, Input } from "@angular/core";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractListPanel } from '../abstract-list-panel';
import { InstanceListComponent } from './instance-list.component';

@Component({
    selector: "instance-list-panel",
    templateUrl: "./instance-list-panel.component.html",
    host: { class: "vbox" }
})
export class InstanceListPanelComponent extends AbstractListPanel {
    @Input() cls: AnnotatedValue<IRI>; //class of the instances

    @ViewChild(InstanceListComponent) viewChildList: InstanceListComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.individual;
    rendering: boolean = false; //override the value in AbstractPanel

    constructor(basicModals: BasicModalsServices, eventHandler: PMKIEventHandler, pmkiProp: PMKIProperties) {
        super(basicModals, eventHandler, pmkiProp);
    }

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

    public openAt(node: AnnotatedValue<IRI>) {
        this.viewChildList.openListAt(node);
    }

    refresh() {
        this.viewChildList.init();
    }

}