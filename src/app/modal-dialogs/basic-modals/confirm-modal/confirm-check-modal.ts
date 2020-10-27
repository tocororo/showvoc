import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AbstractConfirmModal } from './abstract-confirm-modal';

@Component({
	selector: 'confirm-check-modal',
	templateUrl: './confirm-check-modal.html',
	styleUrls: ['../../modals.css']
})
export class ConfirmCheckModal extends AbstractConfirmModal {

	@Input() checkOpts: ConfirmCheckOptions[];


	constructor(public activeModal: NgbActiveModal) {
		super(activeModal);
	}

	ngOnInit() {
		super.ngOnInit();
	}


	ok() {
		this.activeModal.close(this.checkOpts);
	}

	close() {
		this.activeModal.dismiss(this.checkOpts);
	}

}

export class ConfirmCheckOptions {
	label: string;
	value: boolean; //default value
	disabled?: boolean;
	info?: string; //message shown as tooltip on an info icon 
	warning?: string; //message shown as tooltip on a warning icon (useful for example in combo with disabled=true in order to explain the reason)
}