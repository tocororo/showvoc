import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { LinksetMetadata } from 'src/app/models/Metadata';
import { MapleServices } from 'src/app/services/maple.service';
import { PMKIContext } from 'src/app/utils/PMKIContext';
import { AlignmentsListComponent } from './alignments-list.component';

@Component({
    selector: 'alignments-list-panel',
    templateUrl: './alignments-list-panel.component.html',
    host: { class: "vbox" }
})
export class AlignmentsListPanelComponent {

    @ViewChild(AlignmentsListComponent) viewChildList: AlignmentsListComponent;
    @Output() linksetSelected = new EventEmitter<LinksetMetadata>();

    selectedLinkset: LinksetMetadata;

    showPercentage: boolean = false;
    loadingProfile: boolean = false;

    constructor(private mapleService: MapleServices, private basicModals: BasicModalsServices) { }

    refresh() {
        this.viewChildList.init();
    }

    refreshProfile() {
        this.basicModals.confirm("DATASETS.ACTIONS.PROFILE_DATASET", "You're going to refresh the metadata about the dataset '" + PMKIContext.getWorkingProject().getName() + 
            "'. Are you sure?", ModalType.info).then(
            () => {
                this.loadingProfile = true;
                this.mapleService.profileProject().pipe(
                    finalize(() => this.loadingProfile = false)
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