import { Component, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { LinksetMetadata } from 'src/app/models/Metadata';
import { Project } from 'src/app/models/Project';
import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { MapleServices } from 'src/app/services/maple.service';
import { MetadataRegistryServices } from 'src/app/services/metadata-registry.service';
import { PMKIContext } from '../../utils/PMKIContext';

@Component({
    selector: 'alignments-list',
    templateUrl: './alignments-list.component.html',
    host: { class: "structureComponent" }
})
export class AlignmentsListComponent {

    @Output() linksetSelected = new EventEmitter<LinksetMetadata>();

    private workingProject: Project;

    loading: boolean = false;
    missingProfile: boolean = false;

    linksets: LinksetMetadata[];
    selectedLinkset: LinksetMetadata;

    constructor(private metadataRegistryService: MetadataRegistryServices, private mapleService: MapleServices) { }

    ngOnInit() {
        this.workingProject = PMKIContext.getWorkingProject();
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
            finalize(() => this.loading = false),
            map(mappings => {
                return mappings[this.workingProject.getName()];
            })
        );
    }

    private profileProject(project: Project): Observable<void> {
        this.loading = true;
        PMKIContext.setTempProject(project);
        return this.mapleService.profileProject().pipe(
            finalize(() => {
                PMKIContext.removeTempProject();
                this.loading = false;
            })
        );
    }

    private initLinksets(datasetIRI: AnnotatedValue<IRI>) {
        this.loading = true;
        this.metadataRegistryService.getEmbeddedLinksets(datasetIRI.getValue(), null, true).pipe(
            finalize(() => this.loading = false)
        ).subscribe(
            linksets => {
                this.linksets = linksets;
                this.linksets.sort((l1: LinksetMetadata, l2: LinksetMetadata) => {
                    return l1.getTargetDatasetShow().localeCompare(l2.getTargetDatasetShow());
                });
            }
        )
    }


    selectLinkset(linkset: LinksetMetadata) {
        this.selectedLinkset = linkset;
        this.linksetSelected.emit(linkset);
    }

}