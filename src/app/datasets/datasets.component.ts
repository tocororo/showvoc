import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { Project } from '../models/Project';
import { ShowVocConstants } from '../models/ShowVoc';
import { OntoLex, OWL, RDFS, SKOS } from '../models/Vocabulary';
import { ProjectsServices } from '../services/projects.service';
import { Cookie } from '../utils/Cookie';
import { SVContext } from '../utils/SVContext';
import { SVEventHandler } from '../utils/SVEventHandler';

@Component({
    selector: 'datasets-component',
    templateUrl: './datasets.component.html',
    host: { class: "pageComponent" }
})
export class DatasetsComponent implements OnInit {

    allDatasets: DatasetStruct[];
    datasets: DatasetStruct[] = [];

    eventSubscriptions: Subscription[] = [];

    datasetTypeFacets: { label: string, datasetTypes: string[], active: boolean, cookie: string }[] = [
        { label: "KOS", datasetTypes: [SKOS.uri], active: true, cookie: Cookie.DATASETS_FACETS_TYPE_KOS },
        { label: "Ontologies", datasetTypes: [RDFS.uri, OWL.uri], active: true, cookie: Cookie.DATASETS_FACETS_TYPE_ONTOLOGY },
        { label: "Lexicons", datasetTypes: [OntoLex.uri], active: true, cookie: Cookie.DATASETS_FACETS_TYPE_LEXICON }
    ];
    openCheck: boolean = true;

    filterString: string;

    loading: boolean = false;

    instanceName: string;

    translationParam: { instanceName: string };

    constructor(private router: Router, private projectService: ProjectsServices, private eventHandler: SVEventHandler) {
        this.eventSubscriptions.push(this.eventHandler.projectUpdatedEvent.subscribe(
            () => this.initDatasets())
        );
    }

    ngOnInit() {
        this.initCookies();
        this.initDatasets();

        this.instanceName = window['showvoc_instance_name'];
        if (this.instanceName == null) {
            this.instanceName = "ShowVoc";
        }
        this.translationParam = { instanceName: this.instanceName };
    }

    initDatasets() {
        // this.loading = true;
        // this.projectService.listProjectsPerRole(ShowVocConstants.rolePublic).pipe(
        //     finalize(() => { this.loading = false; })
        // ).subscribe(
        //     projects => {
        //         this.allProjects = projects;
        //         this.filterDatasets();
        //     }
        // );

        this.loading = true;
        this.projectService.listProjectsPerRole(ShowVocConstants.rolePublic).pipe(
            finalize(() => { this.loading = false; })
        ).subscribe(
            publicProjects => {
                this.allDatasets = publicProjects.map(d => {
                    return {
                        project: d,
                        accessible: true
                    };
                });
                this.filterSuperUserAccessibleDatasets().subscribe(
                    () => {
                        this.filterDatasets();
                    }
                );
            }
        );
    }

    private filterSuperUserAccessibleDatasets(): Observable<void> {
        if (SVContext.getLoggedUser().isSuperUser(true)) {
            return this.projectService.listProjects(null, true, true).pipe(
                map(suProjects => {
                    this.allDatasets.forEach(p => {
                        if (!suProjects.some(sup => sup.getName() == p.project.getName())) {
                            p.accessible = false;
                        }
                    });
                })
            );
        } else {
            return of(null);
        }
    }

    filterDatasets() {
        let modelFacets: string[] = []; //collect the active model facets
        this.datasetTypeFacets.forEach(f => {
            if (f.active) {
                modelFacets = modelFacets.concat(f.datasetTypes);
            }
        });

        this.datasets = [];
        //filter the results according the search string and the facets
        this.allDatasets.forEach(d => {
            if (
                (
                    this.filterString == null || this.filterString.trim() == "" || //no filter
                    d.project.getName().toUpperCase().includes(this.filterString.toUpperCase()) || //check filter string matches project name
                    d.project.getBaseURI().toUpperCase().includes(this.filterString.toUpperCase()) //check filter string matches project baseuri
                ) &&
                modelFacets.includes(d.project.getModelType()) && //check on model facets
                (!this.openCheck || (this.openCheck && d.project.isOpen())) //check only open facet
            ) {
                this.datasets.push(d);
            }
        });
    }

    onFacetChange() {
        this.updateCookies();
        this.filterDatasets();
    }

    goToProject(project: Project) {
        this.router.navigate(["/datasets/" + project.getName()]);
    }

    private initCookies() {
        this.datasetTypeFacets.forEach(f => {
            f.active = Cookie.getCookie(f.cookie) != "false";
        });
        this.openCheck = Cookie.getCookie(Cookie.DATASETS_FACETS_ONLY_OPEN_PROJECTS) != "false";
    }
    private updateCookies() {
        this.datasetTypeFacets.forEach(f => {
            Cookie.setCookie(f.cookie, f.active + "");
        });
        Cookie.setCookie(Cookie.DATASETS_FACETS_ONLY_OPEN_PROJECTS, this.openCheck + "");
    }

}

interface DatasetStruct {
    project: Project;
    accessible: boolean;
}