import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, from, Observable, Observer } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ConfirmCheckOptions } from 'src/app/modal-dialogs/basic-modals/confirm-modal/confirm-check-modal';
import { ModalOptions, ModalType, TextOrTranslation } from 'src/app/modal-dialogs/Modals';
import { PluginSettingsHandler } from 'src/app/modal-dialogs/shared-modals/plugin-configuration/plugin-configuration-modal';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { Settings } from 'src/app/models/Plugins';
import { ShowVocConstants } from 'src/app/models/ShowVoc';
import { AccessLevel, ExceptionDAO, Project, RemoteRepositorySummary, RepositorySummary } from 'src/app/models/Project';
import { GlobalSearchServices } from 'src/app/services/global-search.service';
import { MapleServices } from 'src/app/services/maple.service';
import { ShowVocServices } from 'src/app/services/showvoc.service';
import { ProjectsServices } from 'src/app/services/projects.service';
import { RepositoriesServices } from 'src/app/services/repositories.service';
import { SVContext } from 'src/app/utils/SVContext';
import { SVEventHandler } from 'src/app/utils/SVEventHandler';
import { CreateProjectModal } from './create-project-modal';
import { LoadDataModal } from './load-data-modal';
import { ProjectSettingsModal } from './project-settings-modal';
import { DeleteRemoteRepoModal } from './remote-repositories/delete-remote-repo-modal';
import { DeleteRemoteRepoReportModal } from './remote-repositories/delete-remote-repo-report-modal';
import { InputOutputServices } from 'src/app/services/input-output.service';
import { RemoteRepoEditorModal } from './remote-repositories/remote-repo-editor-modal';

@Component({
    selector: 'projects-manager',
    templateUrl: './projects-manager.component.html',
    host: { class: "pageComponent" }
})
export class ProjectsManagerComponent {

    private readonly rolePristine: string = ShowVocConstants.rolePristine;
    private readonly roleStaging: string = ShowVocConstants.roleStaging;
    private readonly rolePublic: string = ShowVocConstants.rolePublic;

    projectList: Project[];
    //usefuld attributes to set in the Project objects
    private readonly roleAttr: string = "role"; //the role that the visitor user has in the project (tells the project status)
    private readonly clearingIndexAttr: string = "clearingIndex"; //stores a boolean that tells if the system is clearing the index for the project
    private readonly creatingIndexAttr: string = "creatingIndex"; //stores a boolean that tells if the system is creating the index for the project
    private readonly creatingMetadataAttr: string = "creatingMetadata"; //stores a boolean that tells if the system is creating the metadata for the project
    private readonly openingAttr: string = "opening"; //stores a boolean that tells if the system is creating the index for the project
    private readonly clearingDataAttr: string = "clearingData"; //stores a boolean that tells if the system is clearing the data of project

    private readonly roleStatusMap: { [role: string]: string } = {
        [this.rolePristine]: "Pristine",
        [this.roleStaging]: "Staging",
        [this.rolePublic]: "Public",
    }

    globalCreatingIndex: boolean = false; //when it's true, all the other "create index" button should be disabled


    constructor(private modalService: NgbModal, private projectService: ProjectsServices, private repositoriesService: RepositoriesServices,
        private inputOutputService: InputOutputServices, private svService: ShowVocServices, private globalSearchService: GlobalSearchServices, private mapleService: MapleServices,
        private basicModals: BasicModalsServices, private sharedModals: SharedModalsServices, private router: Router, private eventHandler: SVEventHandler,
        private translateService: TranslateService) { }

    ngOnInit() {
        this.initProjects();
    }

    initProjects() {
        this.projectList = [];

        let listProjectFn: Observable<any>[] = [];
        let roles: string[] = [this.rolePristine, this.roleStaging, this.rolePublic];

        roles.forEach(r => {
            listProjectFn.push(
                this.projectService.listProjectsPerRole(r).pipe(
                    map(projects => {
                        projects.forEach(p => {
                            p[this.roleAttr] = r;
                            this.projectList.push(p);
                        })
                    })
                )
            );
        });
        forkJoin(listProjectFn).subscribe(
            () => {
                this.projectList.sort((p1: Project, p2: Project) => {
                    return p1.getName().toLocaleLowerCase().localeCompare(p2.getName().toLocaleLowerCase());
                });
            }
        );
    }

    createProject() {
        this.modalService.open(CreateProjectModal, new ModalOptions("lg")).result.then(
            () => {
                this.eventHandler.projectUpdatedEvent.emit();
                this.initProjects();
            },
            () => {}
        );
    }

    /** ==========================
     * Actions of project
     * ========================== */

    loadData(project: Project) {
        if (!project.isOpen()) {
            this.basicModals.alert({ key: "ADMINISTRATION.DATASETS.MANAGEMENT.LOAD_DATA" }, { key:"MESSAGES.CANNOT_LOAD_DATA_IN_CLOSED_DATASET" }, ModalType.warning);
            return;
        }
        const modalRef: NgbModalRef = this.modalService.open(LoadDataModal, new ModalOptions("lg"));
        modalRef.componentInstance.project = project;
        modalRef.result.then(
            () => { //load data might update the project status => refresh the projects list
                this.initProjects();
            },
            () => {}
        )
    }

    clearData(project: Project) {
        this.basicModals.confirm({ key: "ADMINISTRATION.DATASETS.MANAGEMENT.CLEAR_DATA" }, { key: "MESSAGES.CLEAR_DATA_CONFIRM", params: { datasetName: project.getName() } }, ModalType.warning).then(
            () => {
                SVContext.setTempProject(project);
                project[this.clearingDataAttr] = true;
                this.inputOutputService.clearData().pipe(
                    finalize(() => {
                        SVContext.removeTempProject();
                        project[this.clearingDataAttr] = false;
                    })
                ).subscribe(
                    () => {
                        this.basicModals.alert({ key: "ADMINISTRATION.DATASETS.MANAGEMENT.LOAD_DATA" }, {key:"MESSAGES.DATA_CLEARED", params: { datasetName: project.getName() }});
                    }
                )
            },
            () => {}
        )
    }

    deleteProject(project: Project) {
        if (project.isOpen()) {
            this.basicModals.alert({ key: "DATASETS.ACTIONS.DELETE_DATASET" }, {key:"MESSAGES.CANNOT_DELETE_OPEN_DATASET"}, ModalType.warning);
            return;
        }
        this.basicModals.confirm({ key: "DATASETS.ACTIONS.DELETE_DATASET" }, {key:"MESSAGES.DELETE_DATASET_CONFIRM_WARN"}, ModalType.warning).then(
            () => {
                //retrieve the remote repositories referenced by the deleting project (this must be done before the deletion in order to prevent errors)
                this.projectService.getRepositories(project, true).subscribe(
                    (repositories: RepositorySummary[]) => {
                        this.projectService.deleteProject(project).subscribe( //delete the project
                            () => {
                                if (repositories.length > 0) { //if the deleted project was linked with remote repositories proceed with the deletion
                                    this.deleteRemoteRepo(project, repositories);
                                }

                                this.eventHandler.projectUpdatedEvent.emit();
                                //remove the project from the list
                                this.projectList.forEach((proj: Project, idx: number, list: Project[]) => {
                                    if (proj.getName() == project.getName()) {
                                        list.splice(idx, 1);
                                    }
                                });
                                //clear the index of the project
                                this.clearIndexImpl(project).subscribe();
                            }
                        )
                    }
                )
            },
            () => { }
        );
    }

    private deleteRemoteRepo(deletedProject: Project, repositories: RepositorySummary[]) {
        this.selectRemoteRepoToDelete(deletedProject, repositories).subscribe( //ask to the user which repo delete
            (deletingRepositories: RemoteRepositorySummary[]) => {
                if (deletingRepositories.length > 0) {
                    this.repositoriesService.deleteRemoteRepositories(deletingRepositories).subscribe( //delete them
                        (exceptions: ExceptionDAO[]) => {
                            if (exceptions.some(e => e != null)) { //some deletion has failed => show the report
                                this.showDeleteRemoteRepoReport(deletingRepositories, exceptions);
                            }
                        }
                    );
                }
            }
        );
    }

    private selectRemoteRepoToDelete(project: Project, repositories: RepositorySummary[]): Observable<RemoteRepositorySummary[]> {
        const modalRef: NgbModalRef = this.modalService.open(DeleteRemoteRepoModal, new ModalOptions("lg"));
        modalRef.componentInstance.project = project;
        modalRef.componentInstance.repositories = repositories;
        return from(
            modalRef.result.then(
                repos => {
                    return repos;
                }
            )
        );
    }

    private showDeleteRemoteRepoReport(deletingRepositories: RemoteRepositorySummary[], exceptions: ExceptionDAO[]) {
        const modalRef: NgbModalRef = this.modalService.open(DeleteRemoteRepoReportModal, new ModalOptions("lg"));
        modalRef.componentInstance.deletingRepositories = deletingRepositories;
        modalRef.componentInstance.exceptions = exceptions;
    }

    createIndex(project: Project) {
        if (!project.isOpen()) {
            this.basicModals.alert({ key: "ADMINISTRATION.DATASETS.MANAGEMENT.CREATE_INDEX" }, {key:"MESSAGES.CANNOT_CREATE_INDEX_OF_CLOSED_DATASET"}, ModalType.warning);
            return;
        }
        this.clearIndexImpl(project).subscribe(
            () => {
                this.createIndexImpl(project).subscribe();
            }
        );
    }
    deleteIndex(project: Project) {
        this.clearIndexImpl(project).subscribe();
    }

    private createIndexImpl(project: Project): Observable<void> {
        return new Observable((observer: Observer<void>) => {
            SVContext.setTempProject(project);
            project[this.creatingIndexAttr] = true;
            this.globalCreatingIndex = true;
            this.globalSearchService.createIndex().pipe(
                finalize(() => {
                    SVContext.removeTempProject();
                    project[this.creatingIndexAttr] = false;
                    this.globalCreatingIndex = false;
                })
            ).subscribe(
                () => observer.next()
            )
        });
    }
    private clearIndexImpl(project: Project): Observable<void> {
        return new Observable((observer: Observer<void>) => {
            project[this.clearingIndexAttr] = true;
            this.globalSearchService.clearSpecificIndex(project.getName()).pipe(
                finalize(() => {
                    project[this.clearingIndexAttr] = false;
                })
            ).subscribe(
                () => observer.next()
            )
        });
    }

    createMapleMetadata(project: Project) {
        if (!project.isOpen()) {
            this.basicModals.alert({ key: "DATASETS.ACTIONS.CREATE_METADATA" }, {key:"MESSAGES.CANNOT_CREATE_METADATA_OF_CLOSED_DATASET"}, ModalType.warning);
            return;
        }
        this.createMapleMetadataImpl(project).subscribe();
    }

    private createMapleMetadataImpl(project: Project): Observable<void> {
        return new Observable((observer: Observer<void>) => {
            SVContext.setTempProject(project);
            project[this.creatingMetadataAttr] = true;
            this.mapleService.profileProject().pipe(
                finalize(() => {
                    SVContext.removeTempProject();
                    project[this.creatingMetadataAttr] = false;
                })
            ).subscribe(
                () => observer.next()
            )
        });
    }

    changeProjectStatus(project: Project, role: string) {
        let confirmationMsg: TextOrTranslation;
        let confirmActionOpt: ConfirmCheckOptions[] = [];
        let createIndexLabel: string = this.translateService.instant("ADMINISTRATION.DATASETS.MANAGEMENT.CREATE_INDEX");
        let deleteIndexLabel: string = this.translateService.instant("ADMINISTRATION.DATASETS.MANAGEMENT.DELETE_INDEX");
        let createMetadataLabel: string = this.translateService.instant("DATASETS.ACTIONS.CREATE_METADATA");
        if (role == ShowVocConstants.rolePublic) { //from staging to public
            confirmationMsg = { key: "MESSAGES.MAKE_DATASET_PUBLIC_CONFIRM"};
            confirmActionOpt.push({ 
                label: createIndexLabel,
                value: project.isOpen(),
                disabled: !project.isOpen(),
                warning: !project.isOpen() ? this.translateService.instant("MESSAGES.INDEX_CREATION_NOT_AVAILABLE_FOR_CLOSED_DATASET") : null
            });
            confirmActionOpt.push({ 
                label: createMetadataLabel,
                value: project.isOpen(),
                disabled: !project.isOpen(),
                warning: !project.isOpen() ? this.translateService.instant("MESSAGES.CANNOT_PROFILE_CLOSED_DATASET") : null
            })
        } else if (role == ShowVocConstants.roleStaging) { //from public to staging
            confirmationMsg = { key: "MESSAGES.MAKE_DATASET_STAGING_CONFIRM"};
            confirmActionOpt.push({ 
                label: deleteIndexLabel,
                value: true,
            });
        }
        this.basicModals.confirmCheck({ key: "ADMINISTRATION.DATASETS.MANAGEMENT.CHANGE_STATUS" }, confirmationMsg, confirmActionOpt, ModalType.warning).then(
            (checkboxOpts: ConfirmCheckOptions[]) => {
                this.svService.setProjectStatus(project.getName(), role).subscribe(
                    () => {
                        this.eventHandler.projectUpdatedEvent.emit();
                        project[this.roleAttr] = role;
                        checkboxOpts.forEach(opt => {
                            if (opt.label == createIndexLabel && opt.value) {
                                this.createIndexImpl(project).subscribe();
                            }
                            if (opt.label == deleteIndexLabel && opt.value) {
                                this.clearIndexImpl(project).subscribe();
                            }
                            if (opt.label == createMetadataLabel && opt.value) {
                                this.createMapleMetadataImpl(project).subscribe();
                            }
                        });
                        if (role == ShowVocConstants.rolePublic) { //project set public => enable universal readability
                            this.projectService.updateUniversalProjectAccessLevel(project, AccessLevel.R).subscribe();
                        } else { //project set not publid => remove universal readability
                            this.projectService.updateUniversalProjectAccessLevel(project).subscribe();
                        }
                    }
                );
            },
            () => {
                return;
            }
        );
    }

    openCloseProject(project: Project) {
        project[this.openingAttr] = true;
        if (project.isOpen()) { //project open => close it
            this.projectService.disconnectFromProject(project).pipe(
                finalize(() => project[this.openingAttr] = false)
            ).subscribe(() => {
                this.eventHandler.projectUpdatedEvent.emit();
                project.setOpen(false);
            });
        } else { //project closed => open it
            this.projectService.accessProject(project).pipe(
                finalize(() => project[this.openingAttr] = false)
            ).subscribe(() => {
                this.eventHandler.projectUpdatedEvent.emit();
                project.setOpen(true);
            });
        }
    }

    editRemoteRepoCredential(project: Project) {
        if (project.isOpen()) {
            this.basicModals.alert({ key: "COMMONS.STATUS.OPERATION_DENIED" }, { key: "MESSAGES.CANNOT_EDIT_OPEN_PROJECT_CREDENTIALS" }, ModalType.warning);
            return;
        }
        const modalRef: NgbModalRef = this.modalService.open(RemoteRepoEditorModal, new ModalOptions('lg'));
        modalRef.componentInstance.project = project;
        return modalRef.result;
    }

    editSettings(project: Project) {
        const modalRef: NgbModalRef = this.modalService.open(ProjectSettingsModal, new ModalOptions());
        modalRef.componentInstance.project = project;
    }

    editDescription(project: Project) {
        this.basicModals.prompt({ key: "ADMINISTRATION.DATASETS.MANAGEMENT.EDIT_DESCRIPTION" }, { value: "Description" }, null, project.getDescription(), null, true).then(
            descr => {
                this.projectService.setProjectProperty(project, "description", descr).subscribe(
                    () => {
                        project.setDescription(descr);
                    }
                );
            },
            () => {}
        )
    }

    editFacets(project: Project) {
        this.sharedModals.configurePlugin(project.getFacets()).then(
            facets => {
                this.projectService.setProjectFacets(project, facets).subscribe(
                    () => {
                        project.setFacets(facets); //update facets in project
                    }
                );
            },
            () => {}
        );
    }

    editCustomFacetsSchema() {
        let handler: PluginSettingsHandler = (facets: Settings) => this.projectService.setCustomProjectFacetsSchema(facets);
        this.projectService.getCustomProjectFacetsSchema().subscribe(facetsSchema => {
            this.sharedModals.configurePlugin(facetsSchema, handler).then(
                () => { //changed settings
                    this.initProjects(); 
                },
                () => {}  //nothing changed
            );    
        });
    }

    /* ============================== */

    goToProject(project: Project) {
        this.router.navigate(["/datasets/" + project.getName()]);
    }

}