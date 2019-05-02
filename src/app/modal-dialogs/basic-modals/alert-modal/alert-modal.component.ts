import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from '../../Modals';

@Component({
	selector: 'app-alert-modal',
	templateUrl: './alert-modal.component.html',
	styleUrls: ['../../modals.css']
})
export class AlertModalComponent implements OnInit {

	@Input() title: string;
	@Input() message: string;
	@Input() type: ModalType;
	@Input() details: string;

	titleClass: string;
	alertClass: string;

	detailsCollapsed: boolean = true;

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
	}

	ok() {
		this.activeModal.close();
	}

	close() {
		this.activeModal.dismiss();
	}

}
