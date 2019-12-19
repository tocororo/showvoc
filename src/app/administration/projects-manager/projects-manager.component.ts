import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Observable, Observer } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ConfirmCheckOptions } from 'src/app/modal-dialogs/basic-modals/confirm-modal/confirm-check-modal';
import { ModalOptions, ModalType } from 'src/app/modal-dialogs/Modals';
import { PmkiConstants } from 'src/app/models/Pmki';
import { Project } from 'src/app/models/Project';
import { GlobalSearchServices } from 'src/app/services/global-search.service';
import { PmkiServices } from 'src/app/services/pmki.service';
import { ProjectsServices } from 'src/app/services/projects.service';
import { PMKIContext } from 'src/app/utils/PMKIContext';
import { CreateProjectModal } from './create-project-modal';
import { LoadDataModal } from './load-data-modal';
import { ProjectSettingsModal } from './project-settings-modal';

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


    constructor(private modalService: NgbModal, private projectService: ProjectsServices, private pmkiService: PmkiServices, 
        private globalSearchService: GlobalSearchServices, private basicModals: BasicModalsServices, private router: Router) { }

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
            this.basicModals.alert("Load data", "Cannot load data into a closed project. Please, open the project and then retry.", ModalType.warning);
            return;
        }
        const modalRef: NgbModalRef = this.modalService.open(LoadDataModal, new ModalOptions("lg"));
        modalRef.componentInstance.project = project;
    }

    deleteProject(project: Project) {
        if (project.isOpen()) {
            this.basicModals.alert("Delete project", "Cannot delete an open project. Please, close the project and then retry.", ModalType.warning);
            return;
        }
        this.basicModals.confirm("Delete project", "Attention, this operation will delete the project " +
            project.getName() + ". Are you sure to proceed?", ModalType.warning).then(
            () => {
                this.projectService.deleteProject(project).subscribe(
                    () => {
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
            },
            () => { }
        );
    }

    createIndex(project: Project) {
        if (!project.isOpen()) {
            this.basicModals.alert("Create index", "Cannot create the index of a closed project. Please, open the project and then retry.", ModalType.warning);
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
            confirmationMsg = "You are going to make the project public, so it will be visible in the Datasets page and the content will be " + 
                "available to the visitors. Do you want to continue?";
            indexActionOpt = { 
                label: "Create index",
                value: project.isOpen(),
                disabled: !project.isOpen(),
                info: !project.isOpen() ? "The index creation is not available for a closed project" : null
            };
            indexActionFn = this.createIndexImpl(project);
        } else if (role == PmkiConstants.roleStaging) { //from public to staging
            confirmationMsg = "You are going to make the project staging, so it will be no more visible in the Datasets page and the " + 
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
            ).subscribe(() => project.setOpen(false));
        } else { //project closed => open it
            this.projectService.accessProject(project).pipe(
                finalize(() => project[this.openingAttr] = false)
            ).subscribe(() => project.setOpen(true));
        }
    }

    editSettings(project: Project) {
        const modalRef: NgbModalRef = this.modalService.open(ProjectSettingsModal, new ModalOptions());
        modalRef.componentInstance.project = project;
    }

    /* ============================== */

    goToProject(project: Project) {
        this.router.navigate(["/datasets/" + project.getName()]);
    }

}