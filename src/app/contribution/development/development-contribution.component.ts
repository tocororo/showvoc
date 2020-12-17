import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { ConfigurationComponents, ConfigurationObject } from 'src/app/models/Configuration';
import { PmkiConversionFormat } from 'src/app/models/Pmki';
import { Project } from 'src/app/models/Project';
import { IRI } from 'src/app/models/Resources';
import { OntoLex, OWL, RDFS, SKOS, SKOSXL } from 'src/app/models/Vocabulary';
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
        { uri: RDFS.uri, show: Project.getPrettyPrintModelType(RDFS.uri) },
        { uri: OWL.uri, show:  Project.getPrettyPrintModelType(OWL.uri) },
        { uri: SKOS.uri, show: Project.getPrettyPrintModelType(SKOS.uri) },
        { uri: OntoLex.uri, show: Project.getPrettyPrintModelType(OntoLex.uri) }
    ];
    selectedSemModel: string;

    lexicalizationModels: { uri: string, show: string }[] = [
        { uri: RDFS.uri, show: Project.getPrettyPrintModelType(RDFS.uri) },
        { uri: SKOS.uri, show: Project.getPrettyPrintModelType(SKOS.uri) },
        { uri: SKOSXL.uri, show: Project.getPrettyPrintModelType(SKOSXL.uri) },
        { uri: OntoLex.uri, show: Project.getPrettyPrintModelType(OntoLex.uri) }
    ];
    selectedLexModel: string;

    constructor(private basicModals: BasicModalsServices, private translateService: TranslateService) {
        super();
    }

    getConfigurationImpl(): ConfigurationObject {
        //check mandatory fields
        let missingField: string;
        if (this.resourceName == null) {
            missingField = this.translateService.instant("CONTRIBUTIONS.FORM.COMMONS.RESOURCE_NAME");
        } else if (this.description == null) {
            missingField = this.translateService.instant("COMMONS.DESCRIPTION");
        } else if (this.baseURI == null) {
            missingField = this.translateService.instant("MODELS.PROJECT.BASE_URI");
        } else if (this.selectedSemModel == null) {
            missingField = this.translateService.instant("MODELS.PROJECT.MODEL");
        } else if (this.selectedLexModel == null) {
            missingField = this.translateService.instant("MODELS.PROJECT.LEXICALIZATION");
        }
        if (missingField != null) {
            this.basicModals.alert({ key: "COMMONS.STATUS.INCOMPLETE_FORM" }, { key: "MESSAGES.MISSING_MANDATORY_FIELD", params: { missingField: missingField } }, ModalType.warning);
            return;
        }
        if (this.conversionRequired && this.selectedFormat == null) {
            this.basicModals.alert({ key: "COMMONS.STATUS.INCOMPLETE_FORM" }, {key:"MESSAGES.NO_CONVERSION_FORMAT_SELECTED"}, ModalType.warning);
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