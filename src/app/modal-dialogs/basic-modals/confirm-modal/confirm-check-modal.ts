import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CheckOptions } from '../../Modals';
import { AbstractConfirmModal } from './abstract-confirm-modal';

@Component({
    selector: 'confirm-check-modal',
    templateUrl: './confirm-check-modal.html',
    styleUrls: ['../../modals.css']
})
export class ConfirmCheckModal extends AbstractConfirmModal {

    @Input() checkOpts: CheckOptions[];


    constructor(public activeModal: NgbActiveModal) {
        super(activeModal);
    }

    ok() {
        this.activeModal.close(this.checkOpts);
    }

    close() {
        this.activeModal.dismiss(this.checkOpts);
    }

}