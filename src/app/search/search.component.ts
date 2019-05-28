import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { concat, Observable, of, forkJoin } from 'rxjs';
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
    
    openProjectFilter: boolean = true;
    filteredRepoIds: string[]; //id (eventually filtered) of the repositories of the results, useful to iterate over them in the view

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

                //compute show of results
                let projectBackup = PMKIContext.getProject();
                let computeResultsShowFunctions: Observable<void>[] = [];
                Object.keys(this.groupedSearchResults).forEach(repoId => {
                    let results: GlobalSearchResult[] = this.groupedSearchResults[repoId];
                    computeResultsShowFunctions.push(this.getComputeResultsShowFn(results));
                });
                forkJoin(...computeResultsShowFunctions).pipe(
                    finalize(() => PMKIContext.setProject(projectBackup)) //restore the previous project in the ctx
                ).subscribe(() => {
                    //order results
                    Object.keys(this.groupedSearchResults).forEach(repoId => {
                        this.groupedSearchResults[repoId].sort((r1: GlobalSearchResult, r2: GlobalSearchResult) => {
                            return r1.show.localeCompare(r2.show);
                        })
                    });
                });


                this.filterSearchResults();
            }
        )
    }

    private filterSearchResults() {
        //collect the repositories ID according the filter
        this.filteredRepoIds = [];
        Object.keys(this.groupedSearchResults).forEach(repoId => {
            if (this.openProjectFilter && this.groupedSearchResults[repoId][0].repository.open || !this.openProjectFilter) {
                this.filteredRepoIds.push(repoId);
            }
        });
        this.filteredRepoIds.sort();
    }

    updateProjectFilters() {
        this.openProjectFilter = !this.openProjectFilter;
        this.updateCookies();
        this.filterSearchResults();
    }

    private getComputeResultsShowFn(results: GlobalSearchResult[]): Observable<void> {
        if (results[0].repository.open) { //if the repository is open, compute the show with a service invokation
            let resources: IRI[] = []
            results.forEach(r => {
                resources.push(r.resource);
            });

            PMKIContext.setProject(new Project(results[0].repository.id));
            return this.resourcesService.getResourcesInfo(resources).pipe(
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

    private initCookies() {
        this.openProjectFilter = Cookie.getCookie(Cookie.SEARCH_FILTERS_ONLY_OPEN_PROJECTS) != "false";
    }
    private updateCookies() {
        Cookie.setCookie(Cookie.SEARCH_FILTERS_ONLY_OPEN_PROJECTS, this.openProjectFilter + "");
    }
}

