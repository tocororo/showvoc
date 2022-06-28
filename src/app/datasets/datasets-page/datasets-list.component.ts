import { Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Project } from '../../models/Project';
import { ShowVocConstants } from '../../models/ShowVoc';
import { ProjectsServices } from '../../services/projects.service';
import { SVContext } from '../../utils/SVContext';
import { SVEventHandler } from '../../utils/SVEventHandler';
import { AbstractDatasetsView } from './abstract-datasets-view.component';

@Component({
    selector: 'datasets-list',
    templateUrl: './datasets-list.component.html',
})
export class DatasetsListComponent extends AbstractDatasetsView {

    datasets: DatasetStruct[] = [];

    constructor(projectService: ProjectsServices, eventHandler: SVEventHandler) {
        super(projectService, eventHandler);
    }

    initDatasets() {
        this.loading = true;
        this.projectService.listProjectsPerRole(ShowVocConstants.rolePublic).pipe(
            finalize(() => { this.loading = false; })
        ).subscribe(
            publicProjects => {
                this.datasets = publicProjects.map(d => {
                    return {
                        project: d,
                        accessible: true
                    };
                });
                this.filterSuperUserAccessibleDatasets();
            }
        );
    }

    private filterSuperUserAccessibleDatasets() {
        //super user cannot access other public datasets for which has no role assigned in, set as not accessible such datasets
        if (SVContext.getLoggedUser().isSuperUser(true)) {
            this.projectService.listProjects(null, true, true).subscribe(
                suProjects => {
                    this.datasets.forEach(d => {
                        if (!suProjects.some(sup => sup.getName() == d.project.getName())) {
                            d.accessible = false;
                        }
                    });
                }
            );
        }
    }


}

interface DatasetStruct {
    project: Project;
    accessible: boolean;
}