import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Resource } from 'src/app/models/Resources';

@Component({
	selector: 'resource-view-modal',
	templateUrl: './resource-view-modal.html',
	styleUrls: ['../../modals.css']
})
export class ResourceViewModal {

	@Input() resource: Resource;
    
	constructor(public activeModal: NgbActiveModal) { }

	ok() {
		this.activeModal.close();
	}

	close() {
		this.activeModal.dismiss();
	}

}
