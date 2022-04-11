import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AbstractConfirmModal } from './abstract-confirm-modal';

@Component({
    selector: 'confirm-modal',
    templateUrl: './confirm-modal.html',
    styleUrls: ['../../modals.css']
})
export class ConfirmModal extends AbstractConfirmModal {

    constructor(public activeModal: NgbActiveModal) {
        super(activeModal);
    }

    ok() {
        this.activeModal.close();
    }

    close() {
        this.activeModal.dismiss();
    }

}
