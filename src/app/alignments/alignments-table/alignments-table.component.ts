import { Component, Input, SimpleChanges } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LinksetMetadata } from 'src/app/models/Metadata';
import { Project } from 'src/app/models/Project';
import { IRI } from 'src/app/models/Resources';
import { MetadataRegistryServices } from 'src/app/services/metadata-registry.service';
import { AlignmentsModalsServices } from '../modals/alignments-modal.service';

@Component({
    selector: 'alignments-table',
    templateUrl: './alignments-table.component.html',
    host: { class: "vbox" },
    styles: [`
        .switch input:checked + span {
            background-color:red;
        }
        .switch input:not(:checked) + span {
            background-color:#red;
        }
    `]
})
export class AlignmentsTableComponent {

    @Input() sourceProject: Project;
    @Input() dataset: IRI;
    @Input() allowExplainMapping: boolean = true; //this component is used in multiple places (e.g. MDR and Alignments page)
        //in MDR there is no "sourceProject" so the mappings should not be explained

    linksets: LinksetMetadata[];

    showPercentage: boolean = false;
    loading: boolean = false;

    constructor(private metadataRegistryService: MetadataRegistryServices, private alignmentsModals: AlignmentsModalsServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataset']) {
            this.initLinksets();
        }
    }

    private initLinksets() {
        this.loading = true;
        this.linksets = null;

        this.metadataRegistryService.getEmbeddedLinksets(this.dataset, null, true).pipe(
            finalize(() => { this.loading = false; })
        ).subscribe(
            linksets => {
                this.linksets = linksets;
            }
        );
    }

    showMappings(linkset: LinksetMetadata) {
        if (this.allowExplainMapping) {
            this.alignmentsModals.openAlignments(this.sourceProject, linkset);
        }
    }

}