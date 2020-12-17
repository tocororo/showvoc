import { Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ConfigurationComponents, ConfigurationObject } from 'src/app/models/Configuration';
import { IRI } from 'src/app/models/Resources';
import { MetadataRegistryServices } from 'src/app/services/metadata-registry.service';
import { AbstractContributionComponent } from '../abstract-contribution.component';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { SemanticTurkey } from 'src/app/models/Vocabulary';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'metadata-contribution',
    templateUrl: './metadata-contribution.component.html'
})
export class MetadataContributionComponent extends AbstractContributionComponent {

    storedConfigurationTypeId: string = ConfigurationComponents.CONTRIBUTION_STORE.CONFIG_IMPL.METADATA;

    loading: boolean = false;

    baseURI: string;

    resourceName: string;
    identity: string;
    dereferenciationSystem: string;
    sparqlEndpoint: string;
    sparqlNoAggregation: boolean;
    uriSpace: string;

    dereferenciationOpts: { uri: string, show: string }[] = [
        { uri: null, show: "Unknown" },
        { uri: SemanticTurkey.standardDereferenciation, show: "Yes" },
        { uri: SemanticTurkey.noDereferenciation, show: "No" },
    ]

    constructor(private metadataRegistryService: MetadataRegistryServices, private basicModals: BasicModalsServices, private translateService: TranslateService) {
        super();
    }

    discover() {
        this.loading = true;

        let baseUriIRI: IRI = new IRI(this.baseURI);
        this.metadataRegistryService.discoverDatasetMetadata(baseUriIRI).pipe(
            finalize(() => this.loading = false)
        ).subscribe(
            dataset => {
                this.resourceName = dataset.title;
                this.identity = dataset.identity;
                this.dereferenciationSystem = dataset.dereferenciationSystem;
                this.sparqlEndpoint = dataset.sparqlEndpointMetadata.id;
                this.sparqlNoAggregation = dataset.sparqlEndpointMetadata.limitations ?
                    dataset.sparqlEndpointMetadata.limitations.some(l => l == "<" + SemanticTurkey.noAggregation + ">") :
                    false;
                this.uriSpace = dataset.uriSpace;
            },
            (err: Error) => {
                //in case discoverDataset throws an exception prevent to contribute metadata
                if (err.name.endsWith("DeniedOperationException")) {
                    this.basicModals.alert({ key: "DATASETS.STATUS.ALREADY_EXISTING_DATASET" }, {key:"MESSAGES.DATASET_ALREADY_IN_METADATA_REGISTRY"}, ModalType.warning);
                }
            }
        );
    }

    getConfigurationImpl(): ConfigurationObject {
        if (this.resourceName == null) {
            this.basicModals.alert({ key: "COMMONS.STATUS.INCOMPLETE_FORM" }, 
                { key: "MESSAGES.MISSING_MANDATORY_FIELD", params: { missingField: this.translateService.instant("CONTRIBUTIONS.FORM.COMMONS.RESOURCE_NAME") } },
                ModalType.warning);
            return;
        }
        let config: ConfigurationObject = {
            baseURI: new IRI(this.baseURI).toNT(),
            resourceName: this.resourceName,
            identity: this.identity ? new IRI(this.identity).toNT() : null,
            dereferenciationSystem: this.dereferenciationSystem ? new IRI(this.dereferenciationSystem).toNT() : null,
            sparqlEndpoint: this.sparqlEndpoint ? new IRI(this.sparqlEndpoint).toNT() : null,
            sparqlLimitations: this.sparqlNoAggregation ? [new IRI(SemanticTurkey.noAggregation).toNT()] : null,
            uriSpace: this.uriSpace
        }
        let emptyMetadata: boolean = true;
        for (let key in config) {
            if (key != "resourceName" && config[key] != null) {
                emptyMetadata = false;
                break;
            }
        }
        if (emptyMetadata) {
            this.basicModals.alert({ key: "COMMONS.STATUS.INCOMPLETE_FORM" }, {key:"MESSAGES.NO_METADATA_PROVIDED"}, ModalType.warning);
            return;
        }
        return config;
    }

}