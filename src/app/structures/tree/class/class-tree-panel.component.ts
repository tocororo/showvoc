import { Component, ViewChild, Input } from "@angular/core";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { SVEventHandler } from 'src/app/utils/SVEventHandler';
import { SVProperties } from 'src/app/utils/SVProperties';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractTreePanel } from '../abstract-tree-panel';
import { ClassTreeComponent } from './class-tree.component';
import { SVContext } from 'src/app/utils/SVContext';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/modal-dialogs/Modals';
import { ClassTreeSettingsModal } from './class-tree-settings-modal';
import { GraphModalServices } from 'src/app/graph/modals/graph-modal.service';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';

@Component({
    selector: "class-tree-panel",
    templateUrl: "./class-tree-panel.component.html",
    host: { class: "vbox" }
})
export class ClassTreePanelComponent extends AbstractTreePanel {
    @ViewChild(ClassTreeComponent) viewChildTree: ClassTreeComponent;

    @Input() roots: IRI[];

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.cls;
    rendering: boolean = false; //override the value in AbstractPanel

    filterEnabled: boolean;

    constructor(basicModals: BasicModalsServices, sharedModals: SharedModalsServices, eventHandler: SVEventHandler, svProp: SVProperties, private graphModals: GraphModalServices, private modalService: NgbModal) {
        super(basicModals, sharedModals, eventHandler, svProp);
    }

    ngOnInit() {
        super.ngOnInit();
        this.filterEnabled = SVContext.getProjectCtx().getProjectPreferences().classTreePreferences.filter.enabled;
    }

    //top bar commands handlers

    refresh() {
        this.viewChildTree.init();
    }

    openModelGraph() {
        this.graphModals.openModelGraph(null, this.rendering);
    }

    openUmlGraph() {
        this.graphModals.openUmlGraph(this.rendering);
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
        let root: IRI;
        if (this.roots != null && this.roots.length == 1) {
            root = this.roots[0];
        }
        this.viewChildTree.openTreeAt(node, null, root);
    }

    settings() {
        const modalRef: NgbModalRef = this.modalService.open(ClassTreeSettingsModal, new ModalOptions());
        modalRef.result.then(
            () => { //changes done
                this.filterEnabled = SVContext.getProjectCtx().getProjectPreferences().classTreePreferences.filter.enabled;
                this.refresh();
            },
            () => {
                //not done
                this.filterEnabled = SVContext.getProjectCtx().getProjectPreferences().classTreePreferences.filter.enabled;
            }
        );
    }

}