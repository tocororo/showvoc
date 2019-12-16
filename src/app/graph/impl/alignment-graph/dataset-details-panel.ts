import { Component, Input, SimpleChanges } from '@angular/core';
import { DatasetMetadata } from 'src/app/models/Metadata';
import { IRI } from 'src/app/models/Resources';
import { MetadataRegistryServices } from 'src/app/services/metadata-registry.service';
import { SemanticTurkey } from 'src/app/models/Vocabulary';

@Component({
    selector: 'dataset-details-panel',
    templateUrl: './dataset-details-panel.html',
    host: { class: "vbox" }
})
export class DatasetDetailsPanel {

    @Input() dataset: IRI;

    datasetMetadata: DatasetMetadata;
    dereferenciationNormalized: string;

    constructor(private metadataRegistryService: MetadataRegistryServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataset']) {
            this.metadataRegistryService.getDatasetMetadata(this.dataset).subscribe(
                metadata => {
                    this.datasetMetadata = metadata;
                    //normalize dereferenciation
                    if (this.datasetMetadata.dereferenciationSystem == null) {
                        this.dereferenciationNormalized = "Unknown";
                    } else if (this.datasetMetadata.dereferenciationSystem == SemanticTurkey.standardDereferenciation) {
                        this.dereferenciationNormalized = "Yes";
                    } else if (this.datasetMetadata.dereferenciationSystem == SemanticTurkey.noDereferenciation) {
                        this.dereferenciationNormalized = "No";
                    } else {
                        this.dereferenciationNormalized = this.datasetMetadata.dereferenciationSystem;
                    }
                }
            )
        }
    }

}