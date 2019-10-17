import { Component } from '@angular/core';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { ConfigurationComponents, ConfigurationObject } from 'src/app/models/Configuration';
import { PmkiConversionFormat } from 'src/app/models/Pmki';
import { IRI } from 'src/app/models/Resources';
import { OntoLex, RDFS, SKOS, SKOSXL } from 'src/app/models/Vocabulary';
import { AbstractContributionComponent } from '../abstract-contribution.component';

@Component({
    selector: 'development-contribution',
    templateUrl: './development-contribution.component.html'
})
export class DevelopmentContributionComponent extends AbstractContributionComponent {

    storedConfigurationTypeId: string = ConfigurationComponents.CONTRIBUTION_STORE.CONFIG_IMPL.DEVELOPMENT;

    conversionRequired: boolean = false;
    inputFormats: PmkiConversionFormat[] = [
        PmkiConversionFormat.EXCEL, PmkiConversionFormat.TBX, PmkiConversionFormat.ZTHES
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

    getConfigurationImpl(): ConfigurationObject {
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