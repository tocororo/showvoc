import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalOptions, TextOrTranslation, TranslationUtils } from 'src/app/modal-dialogs/Modals';
import { CatalogRecord2, DatasetRole } from 'src/app/models/Metadata';
import { IRI } from 'src/app/models/Resources';
import { MetadataRegistryServices } from 'src/app/services/metadata-registry.service';
import { ConnectToAbsDatasetModal, NewDatasetModeEnum } from './connect-to-abs-dataset-modal';
import { MetadataRegistryTreeNodeComponent } from './mdr-tree-node.component';
import { MdrTreeContext, MetadataRegistryTreeComponent } from './mdr-tree.component';
import { NewDatasetModal } from './new-dataset-modal';

@Component({
    selector: "mdr-tree-panel",
    templateUrl: "./mdr-tree-panel.component.html",
    styleUrls: ['./mdr-tree.css'],
    host: { class: "vbox" }
})
export class MetadataRegistryTreePanelComponent {
    @Input() context: MdrTreeContext;
    @Output() nodeSelected = new EventEmitter<CatalogRecord2>();
    @ViewChild(MetadataRegistryTreeComponent) viewChildTree: MetadataRegistryTreeComponent;

    multiselection: boolean = false;

    selectedRecord: CatalogRecord2;

    mdrCreateAuthorized: boolean;
    mdrDeleteAuthorized: boolean;
    mdrUpdateAuthorized: boolean;

    constructor(private metadataRegistryService: MetadataRegistryServices, private basicModals: BasicModalsServices, private modalService: NgbModal, private translate: TranslateService) { }

    ngOnInit() {
        //currently the MDR is accessible only to admin, so set all authorization to true
        this.mdrCreateAuthorized = true;
        this.mdrDeleteAuthorized = true;
        this.mdrUpdateAuthorized = true;
    }

    createConcreteDataset() {
        this.openNewDatasetModal({ key: "METADATA.METADATA_REGISTRY.ACTIONS.CREATE_CONCRETE_DATASET" }, NewDatasetModeEnum.createConcrete).then(
            () => {
                this.refresh();
            },
            () => { }
        );
    }

    connectToAbstractDataset() {
        const modalRef: NgbModalRef = this.modalService.open(ConnectToAbsDatasetModal, new ModalOptions('lg'));
        modalRef.componentInstance.concreteDataset = this.selectedRecord;
        modalRef.result.then(
            () => {
                this.refresh();
            },
            () => { }
        );
    }

    spawnNewAbstractDataset() {
        this.openNewDatasetModal({ key: "METADATA.METADATA_REGISTRY.ACTIONS.SPAWN_ABSTRACT_DATASET" }, NewDatasetModeEnum.spawnAbstract).then(
            () => {
                this.refresh();
            },
            () => { }
        );
    }

    openNewDatasetModal(title: TextOrTranslation, mode: NewDatasetModeEnum) {
        const modalRef: NgbModalRef = this.modalService.open(NewDatasetModal, new ModalOptions('lg'));
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translate);
        modalRef.componentInstance.mode = mode;
        return modalRef.result;
    }


    discoverDataset() {
        this.basicModals.prompt({ key: "METADATA.METADATA_REGISTRY.ACTIONS.DISCOVER_DATASET" }, 
            { value: "IRI", tooltip: { key: "METADATA.METADATA_REGISTRY.ACTIONS.DISCOVER_DATASET_IRI_INFO" } }
        ).then(
            iri => {
                if (IRI.regexp.test(iri)) {
                    this.metadataRegistryService.discoverDataset(new IRI(iri)).subscribe(
                        () => {
                            this.refresh();
                        }
                    );
                } else {
                    this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.INVALID_IRI", params: { iri: iri } });
                }
            }
        );
    }

    deleteRecord() {
        this.metadataRegistryService.deleteCatalogRecord(this.selectedRecord.identity).subscribe(
            () => {
                this.selectedRecord = null;
                this.nodeSelected.emit(null);
                this.refresh();
            }
        );
    }

    disconnectFromAbstractDataset() {
        //look for the abstract dataset which is the parent of the disconnecting concrete one
        let abstractRoot: CatalogRecord2 = this.getAbstractOfSelectedRecord();
        let roots = this.viewChildTree.viewChildrenNode;
        if (roots) {
            roots.forEach(r => {
                if (r.children.find(c => c.identity.equals(this.selectedRecord.identity))) {
                    abstractRoot = r.record;
                }
            });
        }
        this.metadataRegistryService.disconnectFromAbstractDataset(this.selectedRecord.dataset.identity, abstractRoot.dataset.identity).subscribe(
            () => {
                this.refresh();
            }
        );
    }

    isDisconnectDisabled(): boolean {
        if (this.selectedRecord == null) {
            return true;
        } else {
            if (this.selectedRecord.dataset.role == DatasetRole.ROOT) {
                return true;
            } else {
                let abstractRootNode: MetadataRegistryTreeNodeComponent;
                let roots = this.viewChildTree.viewChildrenNode;
                if (roots) {
                    roots.forEach(r => {
                        if (r.children.find(c => c.identity.equals(this.selectedRecord.identity))) {
                            abstractRootNode = r;
                        }
                    });
                    if (abstractRootNode) {
                        return abstractRootNode.children.length < 2;
                    }
                }
            }
        }
        return false;
    }

    private getAbstractOfSelectedRecord(): CatalogRecord2 {
        let abstractRoot: CatalogRecord2;
        let roots = this.viewChildTree.viewChildrenNode;
        if (roots) {
            roots.forEach(r => {
                if (r.children.find(c => c == this.selectedRecord)) {
                    abstractRoot = r.record;
                }
            });
        }
        return abstractRoot;
    }

    refresh() {
        this.viewChildTree.init();
    }

    toggleMultiselection() {
        this.multiselection = !this.multiselection;
    }

    //EVENT LISTENERS
    onNodeSelected(node: CatalogRecord2) {
        this.selectedRecord = node;
        this.nodeSelected.emit(node);
    }

}