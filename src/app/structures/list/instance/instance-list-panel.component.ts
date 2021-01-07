import { Component, ViewChild, Input } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalOptions } from "src/app/modal-dialogs/Modals";
import { InstanceListPreference, InstanceListVisualizationMode } from "src/app/models/Properties";
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { PMKIContext } from "src/app/utils/PMKIContext";
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { SearchBarComponent } from "../../search-bar/search-bar.component";
import { AbstractListPanel } from '../abstract-list-panel';
import { InstanceListComponent } from './instance-list.component';
import { InstanceListSettingsModal } from "./instance-list-settings-modal";

@Component({
    selector: "instance-list-panel",
    templateUrl: "./instance-list-panel.component.html",
    host: { class: "vbox" }
})
export class InstanceListPanelComponent extends AbstractListPanel {
    @Input() cls: AnnotatedValue<IRI>; //class of the instances

    @ViewChild(InstanceListComponent) viewChildList: InstanceListComponent;
    @ViewChild(SearchBarComponent) searchBar: SearchBarComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.individual;
    rendering: boolean = false; //override the value in AbstractPanel

    visualizationMode: InstanceListVisualizationMode;

    closedAlert: boolean;

    constructor(basicModals: BasicModalsServices, eventHandler: PMKIEventHandler, pmkiProp: PMKIProperties, private modalService: NgbModal) {
        super(basicModals, eventHandler, pmkiProp);
    }

    ngOnInit() {
        super.ngOnInit();
        this.visualizationMode = PMKIContext.getProjectCtx().getProjectPreferences().instanceListPreferences.visualization;
    }

    handleSearchResults(results: AnnotatedValue<IRI>[]) {
        this.visualizationMode = PMKIContext.getProjectCtx().getProjectPreferences().instanceListPreferences.visualization;
        if (this.visualizationMode == InstanceListVisualizationMode.standard) {
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
        } else { //search based
            ResourceUtils.sortResources(results, this.rendering ? SortAttribute.show : SortAttribute.value);
            this.viewChildList.forceList(results);
        }
    }

    settings() {
        const modalRef: NgbModalRef = this.modalService.open(InstanceListSettingsModal, new ModalOptions());
        return modalRef.result.then(
            () => {
                this.visualizationMode = PMKIContext.getProjectCtx().getProjectPreferences().instanceListPreferences.visualization;
                if (this.visualizationMode == InstanceListVisualizationMode.searchBased) {
                    this.viewChildList.forceList([]);
                }
                this.refresh();
            },
            () => {}
        );
    }

    refresh() {
        this.visualizationMode = PMKIContext.getProjectCtx().getProjectPreferences().instanceListPreferences.visualization;
        //reinit the list
        this.viewChildList.init();
        if (this.visualizationMode == InstanceListVisualizationMode.searchBased) {
            //in search based visualization repeat the search
            this.searchBar.doSearchImpl();
        }
    }

    public openAt(node: AnnotatedValue<IRI>) {
        this.viewChildList.openListAt(node);
    }

}