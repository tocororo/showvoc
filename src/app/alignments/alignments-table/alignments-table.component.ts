import { Component, Input, SimpleChanges } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LinksetMetadata } from 'src/app/models/Metadata';
import { Project } from 'src/app/models/Project';
import { IRI, AnnotatedValue } from 'src/app/models/Resources';
import { MetadataRegistryServices } from 'src/app/services/metadata-registry.service';
import { AlignmentsModalsServices } from '../modals/alignments-modal.service';

@Component({
    selector: 'alignments-table',
    templateUrl: './alignments-table.component.html',
    host: { class: "vbox" }
})
export class AlignmentsTableComponent {

    @Input() sourceProject: Project;
    @Input() dataset: AnnotatedValue<IRI>;

    loading: boolean = false;
    linksets: LinksetMetadata[];

    constructor(private metadataRegistryService: MetadataRegistryServices, private alignmentsModals: AlignmentsModalsServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataset']) {
            this.initLinksets();
        }
    }

    private initLinksets() {
        this.loading = true;
        this.linksets = null;
        
        this.metadataRegistryService.getEmbeddedLinksets(this.dataset.getValue(), null, true).pipe(
            finalize(() => this.loading = false)
        ).subscribe(
            linksets => {
                this.linksets = linksets;
            }
        );
    }

    showMappings(linkset: LinksetMetadata) {
        this.alignmentsModals.openAlignments(this.sourceProject, linkset);
    }

}