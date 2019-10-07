import { Component } from '@angular/core';
import { ConfigurationComponents, ConfigurationObject } from 'src/app/models/Configuration';
import { AbstractContributionComponent } from '../abstract-contribution.component';
import { SKOS, OntoLex, RDFS, SKOSXL } from 'src/app/models/Vocabulary';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { IRI } from 'src/app/models/Resources';

@Component({
    selector: 'development-contribution',
    templateUrl: './development-contribution.component.html'
})
export class DevelopmentContributionComponent extends AbstractContributionComponent {

    storedConfigurationTypeId: string = ConfigurationComponents.CONTRIBUTION_STORE.CONFIG_IMPL.DEVELOPMENT;

    conversionRequired: boolean = false;
    inputFormats: string[] = [
        "Excel", "TBX", "zThes"
    ]
    selectedFormat: string;

    resourceName: string;
    homepage: string;
    description: string;

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

    constructor(private basicModals: BasicModalsServices) {
        super();
    }

    getConfiguration(): ConfigurationObject {
        //check mandatory fields
        let missingField: string;
        if (this.resourceName == null) {
            missingField = "Resource name";
        } else if (this.description == null) {
            missingField = "Description";
        } else if (this.baseURI == null) {
            missingField = "Base URI";
        } else if (this.selectedSemModel == null) {
            missingField = "Model";
        } else if (this.selectedLexModel == null) {
            missingField = "Lexicalization model";
        }
        if (missingField != null) {
            this.basicModals.alert("Incomplete form", "Missing mandatory field '" + missingField + "'", ModalType.warning);
            return;
        }
        if (this.conversionRequired && this.selectedFormat == null) {
            this.basicModals.alert("Incomplete form", "The 'Conversion required' is checked, but no format has been selected", ModalType.warning);
            return;
        }

        let config: ConfigurationObject = {
            format: this.conversionRequired ? this.selectedFormat : null, 
            resourceName: this.resourceName,
            homepage: this.homepage,
            description: this.description,
            baseURI: new IRI(this.baseURI).toNT(),
            model: new IRI(this.selectedSemModel).toNT(),
            lexicalizationModel: new IRI(this.selectedLexModel).toNT()
        }
        return config;
    }

}