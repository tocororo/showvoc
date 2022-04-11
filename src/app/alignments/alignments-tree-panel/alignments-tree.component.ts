import { Component, EventEmitter, Output, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { LinksetMetadata } from 'src/app/models/Metadata';
import { Project } from 'src/app/models/Project';
import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { MapleServices } from 'src/app/services/maple.service';
import { MetadataRegistryServices } from 'src/app/services/metadata-registry.service';
import { SVContext } from '../../utils/SVContext';

@Component({
    selector: 'alignments-tree',
    templateUrl: './alignments-tree.component.html',
    host: { class: "structureComponent" }
})
export class AlignmentsTreeComponent {
    @Input() showPercentage: boolean;
    @Output() linksetSelected = new EventEmitter<LinksetMetadata>();

    private workingProject: Project;

    loading: boolean = false;
    missingProfile: boolean = false;

    linksets: LinksetMetadata[];
    selectedLinkset: LinksetMetadata;

    constructor(private metadataRegistryService: MetadataRegistryServices, private mapleService: MapleServices) { }

    ngOnInit() {
        this.workingProject = SVContext.getWorkingProject();
        this.init();
    }

    init() {
        this.loading = true;
        this.missingProfile = false;
        this.linksets = null;

        this.getDatasetIRI(this.workingProject).subscribe(
            datasetIRI => {
                if (datasetIRI != null) {
                    this.initLinksets(datasetIRI);
                } else { //missing IRI for project
                    this.missingProfile = true;
                }
            }
        );
    }

    private getDatasetIRI(project: Project): Observable<AnnotatedValue<IRI>> {
        this.loading = true;
        return this.metadataRegistryService.findDatasetForProjects([project]).pipe(
            finalize(() => { this.loading = false; }),
            map(mappings => {
                return mappings[this.workingProject.getName()];
            })
        );
    }

    profileProject(project: Project): Observable<void> {
        this.loading = true;
        SVContext.setTempProject(project);
        return this.mapleService.profileProject().pipe(
            finalize(() => {
                SVContext.removeTempProject();
                this.loading = false;
            })
        );
    }

    private initLinksets(datasetIRI: AnnotatedValue<IRI>) {
        this.loading = true;
        this.metadataRegistryService.getEmbeddedLinksets(datasetIRI.getValue(), null, true).pipe(
            finalize(() => { this.loading = false; })
        ).subscribe(
            linksets => {
                this.linksets = linksets;
                this.linksets.sort((l1: LinksetMetadata, l2: LinksetMetadata) => {
                    return l1.getTargetDatasetShow().localeCompare(l2.getTargetDatasetShow());
                });
                //set the source dataset project, useful for retrieving the mappings
                this.linksets.forEach(l => { l.sourceDatasetProject = this.workingProject; });
            }
        );
    }


    selectLinkset(linkset: LinksetMetadata) {
        if (this.selectedLinkset != null) {
            this.selectedLinkset['selected'] = false;
        }
        this.selectedLinkset = linkset;
        this.selectedLinkset['selected'] = true;
        this.linksetSelected.emit(linkset);
    }

}