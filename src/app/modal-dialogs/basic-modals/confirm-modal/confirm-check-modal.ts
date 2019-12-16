import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AbstractConfirmModal } from './abstract-confirm-modal';

@Component({
	selector: 'confirm-check-modal',
	templateUrl: './confirm-check-modal.html',
	styleUrls: ['../../modals.css']
})
export class ConfirmCheckModal extends AbstractConfirmModal {

	@Input() checkOpt: ConfirmCheckOptions;

	check: boolean;

	constructor(public activeModal: NgbActiveModal) {
		super(activeModal);
	}

	ngOnInit() {
		super.ngOnInit();
		this.check = this.checkOpt.value;
	}


	ok() {
		this.activeModal.close(this.check);
	}

	close() {
		this.activeModal.dismiss(this.check);
	}

}

export class ConfirmCheckOptions {
	label: string;
	value: boolean; //default value
	disabled?: boolean;
	info?: string; //message shown as tooltip on an info icon (useful for example in combo with disabled=true in order to explain the reason)
}