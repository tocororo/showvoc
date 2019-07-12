import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { Project } from '../models/Project';
import { AnnotatedValue, IRI } from '../models/Resources';
import { MapleServices } from '../services/maple.service';
import { MetadataRegistryServices } from '../services/metadata-registry.service';
import { ProjectsServices } from '../services/projects.service';
import { PMKIContext } from '../utils/PMKIContext';
import { AlignmentsModalsServices } from './modals/alignments-modal.service';

@Component({
    selector: 'alignments-component',
    templateUrl: './alignments.component.html',
    host: { class: "pageComponent" }
})
export class AlignmentsComponent implements OnInit {

    sourceProjects: Project[];
    selectedSourceProject: Project;

    loading: boolean = false;
    datasetIRI: AnnotatedValue<IRI>;

    readonly aspectTable: string = "Table";
    readonly aspectGraph: string = "Graph";
    aspects: string[] = [this.aspectTable, this.aspectGraph];
    activeAspect: string = this.aspects[0];


    constructor(private projectService: ProjectsServices, private metadataRegistryService: MetadataRegistryServices, private mapleService: MapleServices,
        private alignmentsModals: AlignmentsModalsServices, private basicModals: BasicModalsServices) { }

    ngOnInit() {
        this.projectService.listProjects(null, false, true).subscribe(
            projects => {
                this.sourceProjects = projects;
            }
        );
    }

    onSourceProjectChange() {
        this.loading = true;

        this.getDatasetIRI(this.selectedSourceProject).subscribe(
            datasetIRI => {
                this.datasetIRI = datasetIRI;
                if (this.datasetIRI == null) { //missing IRI for project => initialize it
                    this.basicModals.confirm("Missing profile", "Unable to find metadata about the project '" + this.selectedSourceProject.getName() +
                        "' in the MetadataRegistry. Do you want to profile the project? (required for the aglignment feature)", ModalType.warning).then(
                        () => { //confirmed
                            this.profileProject(this.selectedSourceProject).subscribe(
                                () => {
                                    this.getDatasetIRI(this.selectedSourceProject).subscribe(
                                        datasetIRI => {
                                            this.datasetIRI = datasetIRI;
                                        }
                                    );
                                }
                            );
                        },
                        () => { //canceled
                            this.selectedSourceProject = null;
                            this.loading = false;
                        }
                    );
                }
            }
        );
    }

    private getDatasetIRI(project: Project): Observable<AnnotatedValue<IRI>> {
        this.loading = true;
        return this.metadataRegistryService.findDatasetForProjects([project]).pipe(
            finalize(() => this.loading = false),
            map(mappings => {
                return mappings[this.selectedSourceProject.getName()];
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

    refreshProfile() {
        this.basicModals.confirm("Profile dataset", "You're going to refresh the metadata about the project '" + this.selectedSourceProject.getName() + 
            "'. Are you sure?", ModalType.info).then(
            () => {
                this.datasetIRI = null;
                this.profileProject(this.selectedSourceProject).subscribe(
                    () => {
                        this.getDatasetIRI(this.selectedSourceProject).subscribe(
                            datasetIRI => {
                                this.datasetIRI = datasetIRI;
                            }
                        );
                    }
                )
            }
        )
    }

}