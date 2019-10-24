import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StableResourceStoredContribution } from 'src/app/models/Contribution';
import { SKOS, OntoLex, RDFS, SKOSXL, SemanticTurkey } from 'src/app/models/Vocabulary';

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