import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Observable, of } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { ModalOptions, ModalType } from '../modal-dialogs/Modals';
import { Project } from '../models/Project';
import { IRI } from '../models/Resources';
import { GlobalSearchResult } from '../models/Search';
import { GlobalSearchServices } from '../services/global-search.service';
import { ResourcesServices } from '../services/resources.service';
import { Cookie } from '../utils/Cookie';
import { SVContext } from '../utils/SVContext';
import { EditLanguageModal } from './edit-language-modal.component';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ShowVocUrlParams } from '../models/ShowVoc';
import { ProjectsServices } from '../services/projects.service';

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

    resultsCount: number;
    excludedResultsCount: number; //results excluded due filters (currently just due the "only open" dataset filter)
    excludedRepoCount: number; //repo excluded due filters

    anyLangFilter: boolean;
    languagesFilter: LanguageFilter[];

    isSuperUser: boolean;
    superUserProjects: Project[];

    constructor(private globalSearchService: GlobalSearchServices, private resourcesService: ResourcesServices, private projectService: ProjectsServices,
        private basicModals: BasicModalsServices, private modalService: NgbModal, private router: Router) { }

    ngOnInit() {
        this.initCookies();
        this.isSuperUser = SVContext.getLoggedUser().isSuperUser(true);
        if (this.isSuperUser) {
            this.projectService.listProjects(null, true, true).subscribe(
                projects => {
                    this.superUserProjects = projects;
                }
            );
        }
    }

    searchKeyHandler() {
        if (this.searchString != null && this.searchString.trim() != "") {
            this.search();
        }
    }

    search() {
        this.lastSearch = this.searchString;
        let langPar: string[] = [];
        if (!this.anyLangFilter) {
            this.languagesFilter.forEach(l => {
                if (l.active) {
                    langPar.push(l.lang);
                }
            });
        }

        this.loading = true;
        this.globalSearchService.search(this.searchString, langPar).pipe(
            finalize(() => { this.loading = false; })
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
                let computeResultsShowFunctions: Observable<void>[] = [];
                Object.keys(this.groupedSearchResults).forEach(repoId => {
                    let results: GlobalSearchResult[] = this.groupedSearchResults[repoId];
                    computeResultsShowFunctions.push(this.getComputeResultsShowFn(results));
                });
                forkJoin(computeResultsShowFunctions).pipe(
                    finalize(() => SVContext.removeTempProject())
                ).subscribe(() => {
                    //order results
                    Object.keys(this.groupedSearchResults).forEach(repoId => {
                        this.groupedSearchResults[repoId].sort((r1: GlobalSearchResult, r2: GlobalSearchResult) => {
                            return r1.show.localeCompare(r2.show);
                        });
                    });
                });
                this.filterSearchResults();
            },
            (err: Error) => {
                if (err.name.endsWith("IndexNotFoundException")) {
                    this.basicModals.alert({ key: "SEARCH.INDEX_NOT_FOUND" }, { key: "MESSAGES.SEARCH_INDEX_NOT_FOUND" }, ModalType.warning);
                }
            }
        );
    }

    private filterSearchResults() {
        this.resultsCount = 0;
        this.excludedResultsCount = 0;
        this.excludedRepoCount = 0;

        //collect the repositories ID according the filter
        this.filteredRepoIds = [];
        Object.keys(this.groupedSearchResults).forEach(repoId => {
            if (this.openProjectFilter && this.groupedSearchResults[repoId][0].repository.open || !this.openProjectFilter) {
                this.filteredRepoIds.push(repoId);
                this.resultsCount += this.groupedSearchResults[repoId].length;
            } else {
                this.excludedRepoCount++;
                this.excludedResultsCount += this.groupedSearchResults[repoId].length;
            }
        });
        this.filteredRepoIds.sort();
    }

    private getComputeResultsShowFn(results: GlobalSearchResult[]): Observable<void> {
        if (this.isResultAccessible(results[0])) { //if the repository is open (and accessible in case of SU), compute the show with a service invokation
            let resources: IRI[] = [];
            results.forEach(r => {
                resources.push(r.resource);
            });

            SVContext.setTempProject(new Project(results[0].repository.id));
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
                    r.show = r.resource.getIRI();
                })
            );
        }
    }

    /**
     * Tells if a given search result is accessible, namely if the repository/project (which the result belongs to) is open and,
     * in case of SuperUser, if user is authorized to access project
     * @param result
     */
    isResultAccessible(result: GlobalSearchResult): boolean {
        //a result is clickable if the related repository is open AND, in case of super user, if the repository is a project for which SU has authorization
        return result.repository.open && 
            (!this.isSuperUser || this.superUserProjects.some(p => p.getName() == result.repository.id));

    }


    goToResource(result: GlobalSearchResult) {
        this.router.navigate(["/datasets/" + result.repository.id + "/data"], { queryParams: { [ShowVocUrlParams.resId]: result.resource.getIRI() } });
    }

    goToDataset(repoId: string) {
        this.router.navigate(["/datasets/" + repoId]);
    }

    /**======================
     * Filters
     * ======================*/

    //Projects

    updateProjectFilter() {
        this.openProjectFilter = !this.openProjectFilter; //commented when replaced dropdown button with checkbox (if dropdown will be restored, decomment this line)
        this.updateCookies();
        if (this.groupedSearchResults) { //if search results are available, filter them
            this.filterSearchResults();
        }
    }

    //Languages

    setAllLanguagesFilter() {
        this.anyLangFilter = true;
        this.languagesFilter.forEach(l => { l.active = false; });
        this.updateCookies();
    }

    activateLanguageFilter(lf: LanguageFilter) {
        lf.active = !lf.active;
        this.anyLangFilter = !this.languagesFilter.some(l => l.active); //if no language is enabled, set the "all languages" to true
        this.updateCookies();
    }

    editLangList() {
        const modalRef: NgbModalRef = this.modalService.open(EditLanguageModal, new ModalOptions());
        modalRef.componentInstance.languages = this.languagesFilter.map(l => l.lang);
        modalRef.result.then(
            (languages: string[]) => {
                let newFilter: LanguageFilter[] = []; //use a temp list in order to keep the "active" status
                languages.forEach(l => {
                    let oldLangFilter = this.languagesFilter.find(lf => lf.lang == l);
                    newFilter.push({ lang: l, active: oldLangFilter ? oldLangFilter.active : false });
                });
                this.languagesFilter = newFilter;
                this.updateCookies();
            },
            () => { }
        );
    }

    private initCookies() {
        //Projects: only open
        this.openProjectFilter = Cookie.getCookie(Cookie.SEARCH_FILTERS_ONLY_OPEN_PROJECTS) != "false";
        //Languages
        let langFilterCookie = Cookie.getCookie(Cookie.SEARCH_FILTERS_LANGUAGES);
        if (langFilterCookie != null) {
            this.languagesFilter = JSON.parse(langFilterCookie);
            this.languagesFilter.sort((l1: LanguageFilter, l2: LanguageFilter) => {
                return l1.lang.localeCompare(l2.lang);
            });
            this.anyLangFilter = !this.languagesFilter.some(l => l.active); //if no language is enabled, set the "all languages" to true
        } else {
            this.languagesFilter = [
                { lang: "de", active: false },
                { lang: "en", active: false },
                { lang: "es", active: false },
                { lang: "fr", active: false },
                { lang: "it", active: false },
            ];
            this.anyLangFilter = true;
        }
    }
    private updateCookies() {
        Cookie.setCookie(Cookie.SEARCH_FILTERS_ONLY_OPEN_PROJECTS, this.openProjectFilter + "");
        Cookie.setCookie(Cookie.SEARCH_FILTERS_LANGUAGES, JSON.stringify(this.languagesFilter));

    }
}

class LanguageFilter {
    lang: string;
    active: boolean;
}