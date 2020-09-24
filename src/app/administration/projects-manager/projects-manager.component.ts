import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, from, Observable, Observer } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ConfirmCheckOptions } from 'src/app/modal-dialogs/basic-modals/confirm-modal/confirm-check-modal';
import { ModalOptions, ModalType } from 'src/app/modal-dialogs/Modals';
import { PmkiConstants } from 'src/app/models/Pmki';
import { ExceptionDAO, Project, RemoteRepositorySummary, RepositorySummary } from 'src/app/models/Project';
import { GlobalSearchServices } from 'src/app/services/global-search.service';
import { PmkiServices } from 'src/app/services/pmki.service';
import { ProjectsServices } from 'src/app/services/projects.service';
import { RepositoriesServices } from 'src/app/services/repositories.service';
import { PMKIContext } from 'src/app/utils/PMKIContext';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { CreateProjectModal } from './create-project-modal';
import { LoadDataModal } from './load-data-modal';
import { ProjectSettingsModal } from './project-settings-modal';
import { DeleteRemoteRepoModal } from './remote-repositories/delete-remote-repo-modal';
import { DeleteRemoteRepoReportModal } from './remote-repositories/delete-remote-repo-report-modal';

@Component({
    selector: 'projects-manager',
    templateUrl: './projects-manager.component.html',
    host: { class: "pageComponent" }
})
export class ProjectsManagerComponent {

    private readonly rolePristine: string = PmkiConstants.rolePristine;
    private readonly roleStaging: string = PmkiConstants.roleStaging;
    private readonly rolePublic: string = PmkiConstants.rolePublic;

    projectList: Project[];
    //usefuld attributes to set in the Project objects
    private readonly roleAttr: string = "role"; //the role that the visitor user has in the project (tells the project status)
    private readonly creatingIndexAttr: string = "creatingIndex"; //stores a boolean that tells if the system is creating the index for the project
    private readonly openingAttr: string = "opening"; //stores a boolean that tells if the system is creating the index for the project

    private readonly roleStatusMap: { [role: string]: string } = {
        [this.rolePristine]: "Pristine",
        [this.roleStaging]: "Staging",
        [this.rolePublic]: "Public",
    }

    globalCreatingIndex: boolean = false; //when it's true, all the other "create index" button should be disabled


    constructor(private modalService: NgbModal, private projectService: ProjectsServices, private repositoriesService: RepositoriesServices,
        private pmkiService: PmkiServices, private globalSearchService: GlobalSearchServices, 
        private basicModals: BasicModalsServices, private router: Router, private eventHandler: PMKIEventHandler) { }

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
            this.basicModals.alert("Load data", "Cannot load data into a closed dataset. Please, open the dataset and then retry.", ModalType.warning);
            return;
        }
        const modalRef: NgbModalRef = this.modalService.open(LoadDataModal, new ModalOptions("lg"));
        modalRef.componentInstance.project = project;
    }

    deleteProject(project: Project) {
        if (project.isOpen()) {
            this.basicModals.alert("Delete dataset", "Cannot delete an open dataset. Please, close the dataset and then retry.", ModalType.warning);
            return;
        }
        this.basicModals.confirm("Delete dataset", "Attention, this operation will delete the dataset " +
            project.getName() + ". Are you sure to proceed?", ModalType.warning).then(
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
            this.basicModals.alert("Create index", "Cannot create the index of a closed dataset. Please, open the dataset and then retry.", ModalType.warning);
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
            PMKIContext.setTempProject(project);
            project[this.creatingIndexAttr] = true;
            this.globalCreatingIndex = true;
            this.globalSearchService.createIndex().pipe(
                finalize(() => {
                    PMKIContext.removeTempProject();
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
            project[this.creatingIndexAttr] = true;
            this.globalCreatingIndex = true;
            this.globalSearchService.clearSpecificIndex(project.getName()).pipe(
                finalize(() => {
                    project[this.creatingIndexAttr] = false;
                    this.globalCreatingIndex = false;
                })
            ).subscribe(
                () => observer.next()
            )
        });
    }

    changeProjectStatus(project: Project, role: string) {
        let confirmationMsg: string;
        let indexActionOpt: ConfirmCheckOptions;
        let indexActionFn: Observable<void>;
        if (role == PmkiConstants.rolePublic) { //from staging to public
            confirmationMsg = "You are going to make the dataset public, so it will be visible in the Datasets page and the content will be " + 
                "available to the visitors. Do you want to continue?";
            indexActionOpt = { 
                label: "Create index",
                value: project.isOpen(),
                disabled: !project.isOpen(),
                info: !project.isOpen() ? "The index creation is not available for a closed dataset" : null
            };
            indexActionFn = this.createIndexImpl(project);
        } else if (role == PmkiConstants.roleStaging) { //from public to staging
            confirmationMsg = "You are going to make the dataset staging, so it will be no more visible in the Datasets page and the " + 
                "visitors will not be able to access its content. Contextually you can delete the index. Do you want to continue?";
            indexActionOpt = { 
                label: "Delete index",
                value: true,
            };
            indexActionFn = this.clearIndexImpl(project);
        }
        this.basicModals.confirmCheck("Change status", confirmationMsg, indexActionOpt, ModalType.warning).then(
            (performIndexAction: boolean) => { //tells if the deletion/creation of the index should be performed
                this.pmkiService.setProjectStatus(project.getName(), role).subscribe(
                    () => {
                        this.eventHandler.projectUpdatedEvent.emit();
                        project[this.roleAttr] = role;
                        if (performIndexAction) {
                            indexActionFn.subscribe();
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

    editSettings(project: Project) {
        const modalRef: NgbModalRef = this.modalService.open(ProjectSettingsModal, new ModalOptions());
        modalRef.componentInstance.project = project;
    }

    editDescription(project: Project) {
        this.basicModals.prompt("Edit dataset description", { value: "Description" }, null, project.getDescription(), null, true).then(
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

    /* ============================== */

    goToProject(project: Project) {
        this.router.navigate(["/datasets/" + project.getName()]);
    }

}