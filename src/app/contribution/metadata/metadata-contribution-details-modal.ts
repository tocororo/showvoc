import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MetadataStoredContribution } from 'src/app/models/Contribution';
import { SemanticTurkey } from 'src/app/models/Vocabulary';

@Component({
    selector: "metadata-contrib-details-modal",
    templateUrl: "./metadata-contribution-details-modal.html",
})
export class MetadataContributionDetailsModal {

    @Input() contribution: MetadataStoredContribution;

    dereferenciationMap: { [uri: string]: string } = {
        null: "Unknown",
        [SemanticTurkey.standardDereferenciation]: "Yes",
        [SemanticTurkey.noDereferenciation]: "No",
    };
    dereferenciationSystem: string; //show of the dereferenciation system according the above map
    sparqlNoAggregation: boolean;

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
        let derefSysIri: string = null;
        if (this.contribution.dereferenciationSystem != null) {
            derefSysIri = this.contribution.dereferenciationSystem.getIRI();
        }
        this.dereferenciationSystem = this.dereferenciationMap[derefSysIri];

        this.sparqlNoAggregation = this.contribution.sparqlLimitations.some(l => l.getIRI() == "<" + SemanticTurkey.noAggregation + ">");
    }

    close() {
        this.activeModal.dismiss();
    }

}