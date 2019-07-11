import { Component, Output, EventEmitter } from '@angular/core';
import { finalize, map } from 'rxjs/operators';
import { ProjectsServices } from '../../services/projects.service';
import { PMKIContext } from '../../utils/PMKIContext';
import { LinksetMetadata } from 'src/app/models/Metadata';
import { Project } from 'src/app/models/Project';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { Observable } from 'rxjs';
import { IRI, AnnotatedValue } from 'src/app/models/Resources';
import { MetadataRegistryServices } from 'src/app/services/metadata-registry.service';
import { MapleServices } from 'src/app/services/maple.service';

@Component({
    selector: 'alignments-list',
    templateUrl: './alignments-list.component.html',
    host: { class: "structureComponent" }
})
export class AlignmentsListComponent {

    @Output() linksetSelected = new EventEmitter<LinksetMetadata>();

    private workingProject: Project;

    loading: boolean = false;

    linksets: LinksetMetadata[];
    selectedLinkset: LinksetMetadata;

    constructor(private projectService: ProjectsServices, private metadataRegistryService: MetadataRegistryServices, private mapleService: MapleServices,
        private basicModals: BasicModalsServices) { }

    ngOnInit() {
        this.workingProject = PMKIContext.getWorkingProject();
        this.init();
    }

    init() {
        this.loading = true;
        this.linksets = null;

        this.getDatasetIRI(this.workingProject).subscribe(
            datasetIRI => {
                if (datasetIRI != null) {
                    this.initLinksets(datasetIRI);
                } else { //missing IRI for project => initialize it
                    this.basicModals.confirm("Missing profile", "Unable to find metadata about the project '" + this.workingProject +
                        "' in the MetadataRegistry. Do you want to profile the project? (required for the aglignment feature)", ModalType.warning).then(
                            () => { //confirmed
                                this.profileProject(this.workingProject).subscribe(
                                    () => {
                                        this.getDatasetIRI(this.workingProject).subscribe(
                                            datasetIRI => {
                                                this.initLinksets(datasetIRI);
                                            }
                                        );
                                    }
                                );
                            },
                            () => { //canceled
                                this.loading = false;
                            }
                        )
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
        this.metadataRegistryService.getEmbeddedLinksets(datasetIRI.getValue()).pipe(
            finalize(() => this.loading = false)
        ).subscribe(
            linksets => {
                this.linksets = linksets;
            }
        )
    }


    selectLinkset(linkset: LinksetMetadata) {
        this.selectedLinkset = linkset;
        this.linksetSelected.emit(linkset);
    }

}