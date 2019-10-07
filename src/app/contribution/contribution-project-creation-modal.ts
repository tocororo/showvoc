import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DevResourceStoredContribution, StableResourceStoredContribution } from 'src/app/models/Contribution';
import { SKOS, OntoLex, RDFS, SKOSXL } from '../models/Vocabulary';

@Component({
    selector: "contribution-project-creation-modal",
    templateUrl: "./contribution-project-creation-modal.html",
})
export class ContributionProjectCreationModal {

    @Input() contribution: DevResourceStoredContribution | StableResourceStoredContribution;

    projectName: string;
    baseURI: string;

    semanticModels: { uri: string, show: string }[] = [
        { uri: SKOS.uri, show: "SKOS" },
        { uri: OntoLex.uri, show: "Ontolex" }
    ];
    selectedSemModel: string;

    lexicalizationModels: { uri: string, show: string }[] = [
        { uri: RDFS.uri, show: "RDFS" },
        { uri: SKOS.uri, show: "SKOS" },
        { uri: SKOSXL.uri, show: "SKOS-XL" },
        { uri: OntoLex.uri, show: "Ontolex" }
    ];
    selectedLexModel: string;

    formLocked: boolean = true;
    lockTooltip: string = "The form has been pre-filled with the information contained in the contribution request. " +
        "It is strongly recommended to leave them as they are. If you desire to change them anyway, you can unlock the field with the following switch."

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
        this.projectName = this.contribution.resourceName;
        this.projectName = this.projectName.replace(/[\W_]+/g," ");//sanitize project name;
        this.baseURI = this.contribution.baseURI.getIRI();
        this.selectedSemModel = this.contribution.model.getIRI();
        this.selectedLexModel = this.contribution.lexicalizationModel.getIRI();
    }

	ok() {

		this.activeModal.close();
	}

	close() {
		this.activeModal.dismiss();
	}

}