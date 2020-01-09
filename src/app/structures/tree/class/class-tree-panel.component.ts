import { Component, ViewChild } from "@angular/core";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractTreePanel } from '../abstract-tree-panel';
import { ClassTreeComponent } from './class-tree.component';
import { PMKIContext } from 'src/app/utils/PMKIContext';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/modal-dialogs/Modals';
import { ClassTreeSettingsModal } from './class-tree-settings-modal';

@Component({
    selector: "class-tree-panel",
    templateUrl: "./class-tree-panel.component.html",
    host: { class: "vbox" }
})
export class ClassTreePanelComponent extends AbstractTreePanel {
    @ViewChild(ClassTreeComponent) viewChildTree: ClassTreeComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.cls;
    rendering: boolean = false; //override the value in AbstractPanel

    filterEnabled: boolean;

	constructor(basicModals: BasicModalsServices, eventHandler: PMKIEventHandler, pmkiProp: PMKIProperties, private modalService: NgbModal) {
		super(basicModals, eventHandler, pmkiProp);
    }

    ngOnInit() {
        super.ngOnInit();
        this.filterEnabled = PMKIContext.getProjectCtx().getProjectPreferences().classTreePreferences.filter.enabled;
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
            this.basicModals.selectResource("Search results", results.length + " results found.", results, this.rendering).then(
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

    settings() {
        const modalRef: NgbModalRef = this.modalService.open(ClassTreeSettingsModal, new ModalOptions());
        // modalRef.result.then(
        //     () => {
        //         this.visualizationMode = PMKIContext.getProjectCtx().getProjectPreferences().conceptTreePreferences.visualization;
        //         if (this.visualizationMode == ConceptTreeVisualizationMode.searchBased) {
        //             this.viewChildTree.forceList([]);
        //         } else {
        //             this.refresh();
        //         }
        //     },
        //     () => { }
        // );
    }

}