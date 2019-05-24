import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { concat, Observable, of } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { Project } from '../models/Project';
import { IRI } from '../models/Resources';
import { GlobalSearchResult } from '../models/Search';
import { RDFS, SKOS, SKOSXL } from '../models/Vocabulary';
import { GlobalSearchServices } from '../services/global-search.service';
import { ResourcesServices } from '../services/resources.service';
import { Cookie } from '../utils/Cookie';
import { PMKIContext } from '../utils/PMKIContext';

@Component({
    selector: 'search-component',
    templateUrl: './search.component.html',
    host: { class: "pageComponent" },
    styles: [`
        .search-result + .search-result {
            margin-top: 1rem;
        }
        .grouped-search-result + .grouped-search-result {
            margin-top: 1rem;
        }
    `]
})
export class SearchComponent {

    searchString: string;
    lastSearch: string;

    loading: boolean = false;

    groupedSearchResults: { [repId: string]: GlobalSearchResult[] };
    groupedSearchResultsRepoIds: string[];

    openProjectFilter: boolean = true;
    private openRepoIds: string[];

    private labelTypeOrder: string[] = [
        SKOSXL.prefLabel.getIRI(), SKOS.prefLabel.getIRI(), RDFS.label.getIRI(),
        SKOSXL.altLabel.getIRI(), SKOS.altLabel.getIRI(),
        SKOSXL.hiddenLabel.getIRI(), SKOS.hiddenLabel.getIRI(),
    ];

    constructor(private globalSearchService: GlobalSearchServices, private resourcesService: ResourcesServices, private router: Router) { }

    ngOnInit() {
        this.initCookies();
    }

    searchKeyHandler() {
        if (this.searchString != null && this.searchString.trim() != "") {
            this.search();
        }
    }

    search() {
        this.lastSearch = this.searchString;

        this.loading = true;
        this.globalSearchService.search(this.searchString).pipe(
            finalize(() => this.loading = false)
        ).subscribe(
            (results: GlobalSearchResult[]) => {
                //group the results by repository ID 
                this.groupedSearchResults = {};
                results.forEach(r => {
                    let resultsInRepo: GlobalSearchResult[] = this.groupedSearchResults[r.repository.id];
                    if (resultsInRepo != null) {
                        resultsInRepo.push(r);
                    } else {
                        this.groupedSearchResults[r.repository.id] = [r];
                    }
                });

                //update the repository IDs list, useful to iterate over groupedSearchResults in the UI
                this.groupedSearchResultsRepoIds = Object.keys(this.groupedSearchResults);
                this.groupedSearchResultsRepoIds.sort();

                //collects the open repositories
                this.openRepoIds = [];
                this.groupedSearchResultsRepoIds.forEach(repoId => {
                    if (this.groupedSearchResults[repoId][0].repository.open) {
                        this.openRepoIds.push(repoId);
                    }
                });

                //compute show of results
                let computeResultsShowFunctions: Observable<void>[] = [];
                this.groupedSearchResultsRepoIds.forEach(repoId => {
                    let results: GlobalSearchResult[] = this.groupedSearchResults[repoId];
                    computeResultsShowFunctions.push(this.getComputeResultsShowFn(results));
                });
                concat(...computeResultsShowFunctions).subscribe();
            }
        )
    }

    private getComputeResultsShowFn(results: GlobalSearchResult[]): Observable<void> {
        if (results[0].repository.open) { //if the repository is open, compute the show with a service invokation
            let resources: IRI[] = []
            results.forEach(r => {
                resources.push(r.resource);
            });

            let projectBackup = PMKIContext.getProject();
            PMKIContext.setProject(new Project(results[0].repository.id));
            return this.resourcesService.getResourcesInfo(resources).pipe(
                finalize(() => PMKIContext.setProject(projectBackup)), //restore the previous project in the ctx
                map(annotated => {
                    annotated.forEach(a => {
                        results.find(r => r.resource.equals(a.getValue())).show = a.getShow();
                    });
                })
            );
        } else { //if the repository is closed, the show is the same IRI
            return of(
                results.forEach(r => {
                    r.show = r.resource.getIRI()
                })
            );
        }
    }


    private goToResource(result: GlobalSearchResult) {
        this.router.navigate(["/datasets/" + result.repository.id], { queryParams: { resId: result.resource.getIRI() } });
    }

    private goToDataset(repoId: string) {
        this.router.navigate(["/datasets/" + repoId]);
    }


    updateProjectFilters() {
        this.openProjectFilter = !this.openProjectFilter;
        this.updateCookies();
    }

    private initCookies() {
        this.openProjectFilter = Cookie.getCookie(Cookie.SEARCH_FILTERS_ONLY_OPEN_PROJECTS) != "false";
    }
    private updateCookies() {
        Cookie.setCookie(Cookie.SEARCH_FILTERS_ONLY_OPEN_PROJECTS, this.openProjectFilter + "");
    }
}

