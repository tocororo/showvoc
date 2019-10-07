import { Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ConfigurationComponents, ConfigurationObject } from 'src/app/models/Configuration';
import { IRI } from 'src/app/models/Resources';
import { MetadataRegistryServices } from 'src/app/services/metadata-registry.service';
import { AbstractContributionComponent } from '../abstract-contribution.component';
import { ModalType } from 'src/app/modal-dialogs/Modals';

@Component({
    selector: 'metadata-contribution',
    templateUrl: './metadata-contribution.component.html'
})
export class MetadataContributionComponent extends AbstractContributionComponent {

    storedConfigurationTypeId: string = ConfigurationComponents.CONTRIBUTION_STORE.CONFIG_IMPL.METADATA;

    loading: boolean = false;

    baseURI: string;

    constructor(private metadataRegistryService: MetadataRegistryServices, private basicModals: BasicModalsServices) {
        super();
    }

    ngOnInit() {}

    discover() {
        this.loading = true;

        let baseUriIRI: IRI = new IRI(this.baseURI);
        // this.metadataRegistryService.findDataset(baseUriIRI).subscribe(
        //     resPosition => {
        //     }
        // )
        this.metadataRegistryService.discoverDataset(baseUriIRI).pipe(
            finalize(() => this.loading = false)
        ).subscribe(
            datasetCatalogIri => {
                this.metadataRegistryService.getDatasetMetadata(datasetCatalogIri.getValue()).subscribe(
                    dataset => {
                    }
                )
            },
            (err: Error) => {
                //in case discoverDataset throws an exception prevent to contribute metadata
                if (err.name.endsWith("DeniedOperationException")) {
                    this.basicModals.alert("Already existing dataset", "A dataset for the provided IRI " + baseUriIRI.toNT() + " is already in the metadata registry", ModalType.warning);
                }
            }
        );
    }

    getConfiguration(): ConfigurationObject {
        //TODO checks
        let config: ConfigurationObject = {
            // resourceName: this.name,
            // homepage: this.homepage,
            // description: this.description,
            // isOwner: this.owner,
            // baseURI: this.baseURI,
            // model: new IRI(this.selectedSemModel),
            // lexicalizationModel: new IRI(this.selectedLexModel)
        }
        return config;
    }

}