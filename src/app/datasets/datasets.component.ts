import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { PmkiConstants } from '../models/Pmki';
import { Project } from '../models/Project';
import { OntoLex, SKOS } from '../models/Vocabulary';
import { GlobalSearchServices } from '../services/global-search.service';
import { ProjectsServices } from '../services/projects.service';
import { Cookie } from '../utils/Cookie';

@Component({
    selector: 'datasets-component',
    templateUrl: './datasets.component.html',
    host: { class: "pageComponent" }
})
export class DatasetsComponent implements OnInit {

    // languages: string[] = ["de", "fr", "en", "es", "it"];
    kosCheck: boolean = true;
    lexiconsCheck: boolean = true;
    openCheck: boolean = true;

    projects: Project[];

    searchString: string;
    lastSearch: string;
    loading: boolean = false;

    constructor(private router: Router, private projectService: ProjectsServices, private globalSearchService: GlobalSearchServices) { }

    ngOnInit() {
        this.initCookies();
        this.searchDataset();
    }

    searchDataset() {
        this.lastSearch = this.searchString;

        let modelFacets: string[] = [];
        if (this.kosCheck) modelFacets.push(SKOS.uri);
        if (this.lexiconsCheck) modelFacets.push(OntoLex.uri);

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
                        ) &&
                        (modelFacets == null || modelFacets.includes(p.getModelType())) //check on model facets
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
        this.kosCheck = Cookie.getCookie(Cookie.DATASETS_FACETS_TYPE_KOS) != "false";
        this.lexiconsCheck = Cookie.getCookie(Cookie.DATASETS_FACETS_TYPE_LEXICON) != "false";
        this.openCheck = Cookie.getCookie(Cookie.DATASETS_FACETS_ONLY_OPEN_PROJECTS) != "false";
    }
    private updateCookies() {
        Cookie.setCookie(Cookie.DATASETS_FACETS_TYPE_KOS, this.kosCheck + "");
        Cookie.setCookie(Cookie.DATASETS_FACETS_TYPE_LEXICON, this.lexiconsCheck + "");
        Cookie.setCookie(Cookie.DATASETS_FACETS_ONLY_OPEN_PROJECTS, this.openCheck + "");
    }

}