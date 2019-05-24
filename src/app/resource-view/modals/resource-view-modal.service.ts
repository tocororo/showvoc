import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/modal-dialogs/Modals';
import { ResViewSettingsModal } from './resource-view-settings-modal';

@Injectable()
export class ResViewModalsServices {

    constructor(private modalService: NgbModal) { }

    /**
     * Opens a resource view in a modal
     * @param resource 
     */
    openSettings() {
        const modalRef: NgbModalRef = this.modalService.open(ResViewSettingsModal, new ModalOptions());
        return modalRef.result;
    }


}