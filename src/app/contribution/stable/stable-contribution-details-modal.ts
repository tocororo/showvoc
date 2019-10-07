import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StableResourceStoredContribution } from 'src/app/models/Contribution';
import { SKOS, OntoLex, RDFS, SKOSXL } from 'src/app/models/Vocabulary';

@Component({
    selector: "stable-contrib-details-modal",
    templateUrl: "./stable-contribution-details-modal.html",
})
export class StableContributionDetailsModal {

    @Input() contribution: StableResourceStoredContribution;

    modelsLabelMap: { [uri: string]: string } = {
        [RDFS.uri]: "RDFS",
        [SKOS.uri]: "SKOS",
        [SKOSXL.uri]: "SKOSXL",
        [OntoLex.uri]: "OntoLex"
    }

    constructor(public activeModal: NgbActiveModal) { }

	// ok() {
	// 	this.activeModal.close();
	// }

	close() {
		this.activeModal.dismiss();
	}

}