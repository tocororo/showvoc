import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { PmkiConstants } from 'src/app/models/Pmki';
import { Project } from 'src/app/models/Project';
import { PmkiServices } from 'src/app/services/pmki.service';
import { ProjectsServices } from 'src/app/services/projects.service';

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

    constructor(private projectService: ProjectsServices, private pmkiService: PmkiServices, private router: Router) {}

    ngOnInit() {
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

    changeProjectStatus(project: Project, role: string) {
        this.pmkiService.setProjectStatus(project.getName(), role).subscribe(
            () => {
                project[this.roleAttr] = role;
            }
        );
    }

    openCloseProject(project: Project) {
        project['loading'] = true;
        if (project.isOpen()) {
            this.projectService.disconnectFromProject(project).pipe(
                finalize(() => project['loading'] = false)
            )
            .subscribe(() => project.setOpen(false));
        } else {
            this.projectService.accessProject(project).pipe(
                finalize(() => project['loading'] = false)
            )
            .subscribe(() => project.setOpen(true));
        }
    }

    goToProject(project: Project) {
        this.router.navigate(["/datasets/" + project.getName()]);
    }

}