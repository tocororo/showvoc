import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MetadataStoredContribution } from 'src/app/models/Contribution';

@Component({
    selector: "metadata-contrib-details-modal",
    templateUrl: "./metadata-contribution-details-modal.html",
})
export class MetadataContributionDetailsModal {

    @Input() contribution: MetadataStoredContribution;

    constructor(public activeModal: NgbActiveModal) { }

	// ok() {
	// 	this.activeModal.close();
	// }

	close() {
		this.activeModal.dismiss();
	}

}