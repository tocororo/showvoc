import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DevResourceStoredContribution } from 'src/app/models/Contribution';
import { Project } from 'src/app/models/Project';
import { OntoLex, OWL, RDFS, SKOS, SKOSXL } from 'src/app/models/Vocabulary';

@Component({
    selector: "development-contrib-details-modal",
    templateUrl: "./development-contribution-details-modal.html",
})
export class DevelopmentContributionDetailsModal {

    @Input() contribution: DevResourceStoredContribution;

    modelsLabelMap: { [uri: string]: string } = {
        [RDFS.uri]: Project.getPrettyPrintModelType(RDFS.uri),
        [OWL.uri]: Project.getPrettyPrintModelType(OWL.uri),
        [SKOS.uri]: Project.getPrettyPrintModelType(SKOS.uri),
        [SKOSXL.uri]: Project.getPrettyPrintModelType(SKOSXL.uri),
        [OntoLex.uri]: Project.getPrettyPrintModelType(OntoLex.uri)
    }

    constructor(public activeModal: NgbActiveModal) { }

    // ok() {
    // 	this.activeModal.close();
    // }

    close() {
        this.activeModal.dismiss();
    }

}