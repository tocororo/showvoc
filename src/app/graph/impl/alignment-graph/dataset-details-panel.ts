import { Component, Input, SimpleChanges } from '@angular/core';
import { DatasetMetadata } from 'src/app/models/Metadata';
import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { MetadataRegistryServices } from 'src/app/services/metadata-registry.service';

@Component({
    selector: 'dataset-details-panel',
    templateUrl: './dataset-details-panel.html',
    host: { class: "vbox" }
})
export class DatasetDetailsPanel {

    @Input() dataset: IRI;

    datasetMetadata: DatasetMetadata;

    constructor(private metadataRegistryService: MetadataRegistryServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataset']) {
            this.metadataRegistryService.getDatasetMetadata(this.dataset).subscribe(
                metadata => {
                    this.datasetMetadata = metadata;
                }
            )
        }
    }

}