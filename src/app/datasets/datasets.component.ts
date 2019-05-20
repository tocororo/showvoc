import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Project } from '../models/Project';
import { OntoLex, SKOS } from '../models/Vocabulary';
import { GlobalSearchServices } from '../services/global-search.service';
import { ProjectsServices } from '../services/projects.service';
import { Cookie } from '../utils/Cookie';
import { PMKIContext } from '../utils/PMKIContext';

@Component({
    selector: 'datasets-component',
    templateUrl: './datasets.component.html',
    host: { class: "pageComponent" }
})
export class DatasetsComponent implements OnInit {

    languages: string[] = ["de", "fr", "en", "es", "it"];
    kosCheck: boolean = true;
    lexiconsCheck: boolean = true;
    openCheck: boolean = true;

    projects: Project[];

    searchString: string;
    lastSearch: string;
    loading: boolean = false;
    globalCreatingIndex: boolean = false; //when it's true, all the other "create index" button should be disabled

    constructor(private route: ActivatedRoute, private router: Router, private projectService: ProjectsServices,
        private globalSearchService: GlobalSearchServices) { }

    ngOnInit() {
        this.initCookies();
        this.route.queryParams.subscribe(params => {
            let search = params['search'];
            this.searchString = search;
            this.searchDataset();
        });
    }

    searchDataset() {
        this.lastSearch = this.searchString;

        let modelFacets: string[] = [];
        if (this.kosCheck) modelFacets.push(SKOS.uri);
        if (this.lexiconsCheck) modelFacets.push(OntoLex.uri);

        this.loading = true;
        this.projectService.listProjects(null, false, false).pipe(
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
                        ((this.openCheck && p.isOpen()) || !this.openCheck) && //check on open/close
                        (modelFacets == null || modelFacets.includes(p.getModelType()))) //check on facets
                    {
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

    private createIndex(project: Project) {
        /**
         * create index requires project set as ctx_project.
         * Here store in a temp variable the currently open project in order to restore it once the index is created
         */
        let activeProject: Project = PMKIContext.getProject();
        PMKIContext.setProject(project);
        project['creatingIndex'] = true;
        this.globalCreatingIndex = true;
        this.globalSearchService.clearSpecificIndex().subscribe(
            () => {
                this.globalSearchService.createIndex().pipe(
                    finalize(() => {
                        project['creatingIndex'] = false;
                        this.globalCreatingIndex = false;
                        PMKIContext.setProject(activeProject); //restore the project active
                    })
                ).subscribe();
            }
        );
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