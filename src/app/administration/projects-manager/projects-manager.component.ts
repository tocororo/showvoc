import { Component } from '@angular/core';
import { Project } from 'src/app/models/Project';
import { ProjectsServices } from 'src/app/services/projects.service';
import { PmkiServices } from 'src/app/services/pmki.service';
import { PmkiConstants } from 'src/app/models/Pmki';

@Component({
    selector: 'projects-manager',
    templateUrl: './projects-manager.component.html',
    host: { class: "pageComponent" }
})
export class ProjectsManagerComponent {

    private readonly rolePristine: string = PmkiConstants.rolePristine;
    private readonly roleStaging: string = PmkiConstants.roleStaging;
    private readonly rolePublic: string = PmkiConstants.rolePublic;

    private readonly roleStatusMap: {[role: string]: string} = {
        [this.rolePristine]: "Pristine",
        [this.roleStaging]: "Staging",
        [this.rolePublic]: "Public",
    }

    private readonly roleAttr: string = "role";

    projectList: Project[];
    selectedProject: Project;

    constructor(private projectService: ProjectsServices, private pmkiService: PmkiServices) {}

    ngOnInit() {
        this.projectList = [];
        let roles: string[] = [this.rolePristine, this.roleStaging, this.rolePublic];
        roles.forEach(r => {
            this.projectService.listProjectsPerRole(r).subscribe(
                projects => {
                    projects.forEach(p => {

                        p[this.roleAttr] = r;
                        this.projectList.push(p);
                    })
                }
            );
        });
    }

    selectProject(project: Project) {
        if (this.selectedProject == project) {
            this.selectedProject = null;
        } else {
            this.selectedProject = project;
        }
    }

    changeProjectStatus(role: string) {
        this.pmkiService.setProjectStatus(this.selectedProject.getName(), role).subscribe(
            () => {
                this.selectedProject[this.roleAttr] = role;
            }
        )
    }

}