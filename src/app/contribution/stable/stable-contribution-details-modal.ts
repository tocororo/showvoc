import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StableResourceStoredContribution } from 'src/app/models/Contribution';
import { Project } from 'src/app/models/Project';
import { OntoLex, OWL, RDFS, SemanticTurkey, SKOS, SKOSXL } from 'src/app/models/Vocabulary';

@Component({
    selector: "stable-contrib-details-modal",
    templateUrl: "./stable-contribution-details-modal.html",
})
export class StableContributionDetailsModal {

    @Input() contribution: StableResourceStoredContribution;

    modelsLabelMap: { [uri: string]: string } = {
        [RDFS.uri]: Project.getPrettyPrintModelType(RDFS.uri),
        [OWL.uri]: Project.getPrettyPrintModelType(OWL.uri),
        [SKOS.uri]: Project.getPrettyPrintModelType(SKOS.uri),
        [SKOSXL.uri]: Project.getPrettyPrintModelType(SKOSXL.uri),
        [OntoLex.uri]: Project.getPrettyPrintModelType(OntoLex.uri)
    };

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