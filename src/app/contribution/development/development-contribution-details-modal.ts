import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DevResourceStoredContribution } from 'src/app/models/Contribution';
import { OntoLex, RDFS, SKOS, SKOSXL } from 'src/app/models/Vocabulary';

@Component({
    selector: "development-contrib-details-modal",
    templateUrl: "./development-contribution-details-modal.html",
})
export class DevelopmentContributionDetailsModal {

    @Input() contribution: DevResourceStoredContribution;

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