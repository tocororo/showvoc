import { Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { ConfigurationComponents, ConfigurationObject } from 'src/app/models/Configuration';
import { IRI } from 'src/app/models/Resources';
import { OntoLex, RDFS, SKOS, SKOSXL } from 'src/app/models/Vocabulary';
import { MetadataRegistryServices } from 'src/app/services/metadata-registry.service';
import { AbstractContributionComponent } from '../abstract-contribution.component';

@Component({
    selector: 'stable-contribution',
    templateUrl: './stable-contribution.component.html'
})
export class StableContributionComponent extends AbstractContributionComponent {

    storedConfigurationTypeId: string = ConfigurationComponents.CONTRIBUTION_STORE.CONFIG_IMPL.STABLE;

    loading: boolean = false;

    resourceName: string;
    homepage: string;
    description: string;
    owner: boolean = false;

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

    constructor(private metadataRegistryService: MetadataRegistryServices, private basicModals: BasicModalsServices) {
        super();
    }

    ngOnInit() {}

    // discover() {
    //     this.loading = true;
    //     this.metadataRegistryService.discoverDatasetMetadata(new IRI(this.baseURI)).pipe(
    //         finalize(() => this.loading = false)
    //     ).subscribe(
    //         stResp => {

    //         }
    //     );
    // }

    isBaseUriValid(): boolean {
        return IRI.regexp.test(this.baseURI);
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
        let config: ConfigurationObject = {
            resourceName: this.resourceName,
            homepage: this.homepage,
            description: this.description,
            isOwner: this.owner,
            baseURI: new IRI(this.baseURI).toNT(),
            model: new IRI(this.selectedSemModel).toNT(),
            lexicalizationModel: new IRI(this.selectedLexModel).toNT()
        }
        return config;
    }

}