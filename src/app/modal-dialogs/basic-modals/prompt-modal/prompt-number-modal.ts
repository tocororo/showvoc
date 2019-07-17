import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from '../../Modals';

@Component({
	selector: 'prompt-number-modal',
	templateUrl: './prompt-number-modal.html',
	styleUrls: ['../../modals.css']
})
export class PromptNumberModal implements OnInit {

	@Input() title: string;
	@Input() message: string;
	@Input() type: ModalType;
	@Input() value: number;
	@Input() min: number;
	@Input() max: number;
	@Input() step: number;

	titleClass: string;
    alertClass: string;

	constructor(public activeModal: NgbActiveModal) { }

	ngOnInit() {
		if (this.type == ModalType.info) {
			this.titleClass = "text-info";
			this.alertClass = "alert alert-info";
		} else if (this.type == ModalType.warning) {
			this.titleClass = "text-warning";
			this.alertClass = "alert alert-warning";
		} else if (this.type == ModalType.error) {
			this.titleClass = "text-danger";
			this.alertClass = "alert alert-danger";
		}

		if (this.value == null) {
			this.value = 1;
		}
	}

	isInputValid(): boolean {
		return (
			typeof this.value == "number" && 
			(this.min == null || (this.min != null && this.value >= this.min)) && 
			(this.max == null || (this.max != null && this.value <= this.max))
		);
    }

	ok() {
		this.activeModal.close(this.value);
	}

	close() {
		this.activeModal.dismiss();
	}

}
