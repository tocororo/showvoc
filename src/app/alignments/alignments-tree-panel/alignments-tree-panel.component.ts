import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { LinksetMetadata } from 'src/app/models/Metadata';
import { MapleServices } from 'src/app/services/maple.service';
import { SVContext } from 'src/app/utils/SVContext';
import { AlignmentsTreeComponent } from './alignments-tree.component';

@Component({
    selector: 'alignments-tree-panel',
    templateUrl: './alignments-tree-panel.component.html',
    host: { class: "vbox" }
})
export class AlignmentsTreePanelComponent {

    @ViewChild(AlignmentsTreeComponent) viewChildTree: AlignmentsTreeComponent;
    @Output() linksetSelected = new EventEmitter<LinksetMetadata>();

    selectedLinkset: LinksetMetadata;

    showPercentage: boolean = false;
    loadingProfile: boolean = false;

    constructor(private mapleService: MapleServices, private basicModals: BasicModalsServices) { }

    refresh() {
        this.viewChildTree.init();
    }

    refreshProfile() {
        this.basicModals.confirm({ key: "DATASETS.ACTIONS.PROFILE_DATASET" },
            { key: "MESSAGES.REFRESH_METADATA_CONFIRM", params: { datasetName: SVContext.getWorkingProject().getName() } }, ModalType.info).then(
                () => {
                    this.loadingProfile = true;
                    this.mapleService.profileProject().pipe(
                        finalize(() => { this.loadingProfile = false; })
                    ).subscribe(
                        () => {
                            this.refresh();
                        }
                    );
                }
            );
    }

    onLinksetSelected(linkset: LinksetMetadata) {
        this.selectedLinkset = linkset;
        this.linksetSelected.emit(linkset);
    }

}