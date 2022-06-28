import { Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Project, ProjectFacets } from '../../models/Project';
import { ShowVocConstants } from '../../models/ShowVoc';
import { ProjectsServices } from '../../services/projects.service';
import { Cookie } from '../../utils/Cookie';
import { SVContext } from '../../utils/SVContext';
import { SVEventHandler } from '../../utils/SVEventHandler';
import { AbstractDatasetsView } from './abstract-datasets-view.component';

@Component({
    selector: 'datasets-dirs',
    templateUrl: './datasets-dirs.component.html',
})
export class DatasetsDirsComponent extends AbstractDatasetsView {

    datasetDirs: DatasetDirEntry[];

    constructor(projectService: ProjectsServices, eventHandler: SVEventHandler) {
        super(projectService, eventHandler);
    }

    initDatasets() {
        let bagOfFacet = this.getCurrentFacetBagOf();
        this.loading = true;
        this.projectService.retrieveProjects(bagOfFacet, null, false, false, ShowVocConstants.rolePublic).pipe(
            finalize(() => { this.loading = false; })
        ).subscribe(
            projectBags => {
                this.datasetDirs = [];
                Object.keys(projectBags).forEach(bag => {
                    let dirEntry = new DatasetDirEntry(bag);
                    dirEntry.datasets = projectBags[bag].map(p => {
                        return {
                            project: p,
                            accessible: true
                        };
                    });
                    this.datasetDirs.push(dirEntry);
                });
                this.datasetDirs.sort((d1: DatasetDirEntry, d2: DatasetDirEntry) => {
                    if (d1.dirName == null || d1.dirName == "") return 1;
                    else if (d2.dirName == null || d2.dirName == "") return -1;
                    else return d1.dirName.localeCompare(d2.dirName);
                });
                //init open/close directory according the stored cookie
                let collapsedDirs: string[] = this.retrieveCollapsedDirectoriesCookie();
                this.datasetDirs.forEach(pd => {
                    pd.open = !collapsedDirs.includes(pd.dirName);
                });
                //init dir displayName (e.g.: prjLexModel and prjModel have values that can be written as RDFS, OWL, SKOS...)
                this.datasetDirs.forEach(pd => { pd.dirDisplayName = pd.dirName; }); //init with the same dir as default
                if (bagOfFacet == ProjectFacets.prjLexModel || bagOfFacet == ProjectFacets.prjModel) {
                    this.datasetDirs.forEach(pd => {
                        pd.dirDisplayName = Project.getPrettyPrintModelType(pd.dirName);
                    });
                }
                this.filterSuperUserAccessibleDatasets();
            }
        );
    }

    private filterSuperUserAccessibleDatasets() {
        //super user cannot access other public datasets for which has no role assigned in, set as not accessible such datasets
        if (SVContext.getLoggedUser().isSuperUser(true)) {
            this.projectService.listProjects(null, true, true).subscribe(
                suProjects => {
                    this.datasetDirs.forEach(dir => {
                        dir.datasets.forEach(d => {
                            if (!suProjects.some(sup => sup.getName() == d.project.getName())) {
                                d.accessible = false;
                            }
                        });
                    });
                }
            );
        }
    }

    toggleDirectory(dir: DatasetDirEntry) {
        dir.open = !dir.open;
        //update collapsed directories cookie
        this.storeCollpasedDirectoriesCookie();
    }

    private getCurrentFacetBagOf() {
        return Cookie.getCookie(Cookie.PROJECT_FACET_BAG_OF);
    }

    private retrieveCollapsedDirectoriesCookie(): string[] {
        let collapsedDirs: string[] = [];
        let cds: CollapsedDirStore;
        let collapsedDirsCookie: string = Cookie.getCookie(Cookie.PROJECT_COLLAPSED_DIRS);
        if (collapsedDirsCookie != null) {
            try { //cookie might be not parsed, in case return empty list
                cds = JSON.parse(collapsedDirsCookie);
                if (cds.facet == this.getCurrentFacetBagOf()) {
                    collapsedDirs = cds.dirs;
                    collapsedDirs.forEach((dir, index, list) => { //replace the serialized "null" directory with the null value
                        if (dir == "null") list[index] = null;
                    });
                }
            } catch { }
        }
        return collapsedDirs;
    }

    private storeCollpasedDirectoriesCookie() {
        let collapsedDirs: string[] = [];
        this.datasetDirs.forEach(pd => {
            if (!pd.open) {
                let dirNameValue = pd.dirName != null ? pd.dirName : "null";
                collapsedDirs.push(dirNameValue);
            }
        });
        let cds: CollapsedDirStore = {
            facet: this.getCurrentFacetBagOf(),
            dirs: collapsedDirs
        };
        Cookie.setCookie(Cookie.PROJECT_COLLAPSED_DIRS, JSON.stringify(cds));
    }

}

interface DatasetStruct {
    project: Project;
    accessible: boolean;
}

class DatasetDirEntry {
    dirName: string;
    dirDisplayName: string;
    open: boolean;
    datasets: DatasetStruct[];
    constructor(dirName: string) {
        this.dirName = dirName;
        this.open = true;
        this.datasets = [];
    }
}

interface CollapsedDirStore {
    facet: string; //facet needed to check that the current facet (on which the bag-of is based) is the same of the stored cookie
    dirs: string[];
}