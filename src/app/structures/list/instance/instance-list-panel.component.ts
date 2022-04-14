import { Component, Input, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalOptions } from "src/app/modal-dialogs/Modals";
import { InstanceListVisualizationMode } from "src/app/models/Properties";
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { SVContext } from "src/app/utils/SVContext";
import { SVEventHandler } from 'src/app/utils/SVEventHandler';
import { SVProperties } from 'src/app/utils/SVProperties';
import { SearchBarComponent } from "../../search-bar/search-bar.component";
import { AbstractListPanel } from '../abstract-list-panel';
import { InstanceListSettingsModal } from "./instance-list-settings-modal";
import { InstanceListComponent } from './instance-list.component';

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

    constructor(basicModals: BasicModalsServices, eventHandler: SVEventHandler, svProp: SVProperties, private modalService: NgbModal) {
        super(basicModals, eventHandler, svProp);
    }

    ngOnInit() {
        super.ngOnInit();
        this.visualizationMode = SVContext.getProjectCtx().getProjectPreferences().instanceListPreferences.visualization;
    }

    handleSearchResults(results: AnnotatedValue<IRI>[]) {
        this.visualizationMode = SVContext.getProjectCtx().getProjectPreferences().instanceListPreferences.visualization;
        if (this.visualizationMode == InstanceListVisualizationMode.standard) {
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
        } else { //search based
            ResourceUtils.sortResources(results, this.rendering ? SortAttribute.show : SortAttribute.value);
            this.viewChildList.forceList(results);
        }
    }

    settings() {
        const modalRef: NgbModalRef = this.modalService.open(InstanceListSettingsModal, new ModalOptions());
        return modalRef.result.then(
            () => {
                this.visualizationMode = SVContext.getProjectCtx().getProjectPreferences().instanceListPreferences.visualization;
                if (this.visualizationMode == InstanceListVisualizationMode.searchBased) {
                    this.viewChildList.forceList([]);
                }
                this.refresh();
            },
            () => {}
        );
    }

    refresh() {
        this.visualizationMode = SVContext.getProjectCtx().getProjectPreferences().instanceListPreferences.visualization;
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