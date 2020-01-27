import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { PmkiConstants } from '../models/Pmki';
import { Project } from '../models/Project';
import { OntoLex, OWL, RDFS, SKOS } from '../models/Vocabulary';
import { ProjectsServices } from '../services/projects.service';
import { Cookie } from '../utils/Cookie';

@Component({
    selector: 'datasets-component',
    templateUrl: './datasets.component.html',
    host: { class: "pageComponent" }
})
export class DatasetsComponent implements OnInit {

    datasetTypeFacets: { label: string, datasetTypes: string[], active: boolean, cookie: string }[] = [
        { label: "KOS", datasetTypes: [SKOS.uri], active: true, cookie: Cookie.DATASETS_FACETS_TYPE_KOS },
        { label: "Ontologies", datasetTypes: [RDFS.uri, OWL.uri], active: true, cookie: Cookie.DATASETS_FACETS_TYPE_ONTOLOGY },
        { label: "Lexicons", datasetTypes: [OntoLex.uri], active: true, cookie: Cookie.DATASETS_FACETS_TYPE_LEXICON }
    ];

    openCheck: boolean = true;

    projects: Project[];

    searchString: string;
    lastSearch: string;
    loading: boolean = false;

    constructor(private router: Router, private projectService: ProjectsServices) { }

    ngOnInit() {
        this.initCookies();
        this.searchDataset();
    }

    searchDataset() {
        this.lastSearch = this.searchString;

        let modelFacets: string[] = []; //collect the active model facets
        this.datasetTypeFacets.forEach(f => {
            if (f.active) {
                modelFacets = modelFacets.concat(f.datasetTypes)
            }
        })

        this.loading = true;
        this.projectService.listProjectsPerRole(PmkiConstants.rolePublic, null, this.openCheck).pipe(
            finalize(() => this.loading = false)
        ).subscribe(
            projects => {
                this.projects = [];
                //filter the results according the search string and the facets
                projects.forEach(p => {
                    if (
                        (this.searchString == null || this.searchString.trim() == "" || //empty search
                            p.getName().toUpperCase().includes(this.searchString.toUpperCase()) || //check search string matches project name
                            p.getBaseURI().toUpperCase().includes(this.searchString.toUpperCase()) //check search string matches project baseuri
                        ) && modelFacets.includes(p.getModelType()) //check on model facets
                    ) {
                        this.projects.push(p);
                    }
                });
            }
        )
    }

    onFacetChange() {
        this.updateCookies();
        this.searchDataset();
    }

    private goToProject(project: Project) {
        this.router.navigate(["/datasets/" + project.getName()]);
    }

    private initCookies() {
        this.datasetTypeFacets.forEach(f => {
            f.active = Cookie.getCookie(f.cookie) != "false";
        })
        this.openCheck = Cookie.getCookie(Cookie.DATASETS_FACETS_ONLY_OPEN_PROJECTS) != "false";
    }
    private updateCookies() {
        this.datasetTypeFacets.forEach(f => {
            Cookie.setCookie(f.cookie, f.active + "");
        })
        Cookie.setCookie(Cookie.DATASETS_FACETS_ONLY_OPEN_PROJECTS, this.openCheck + "");
    }

}