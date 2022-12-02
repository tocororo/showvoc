import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { SharedModalsServices } from '../modal-dialogs/shared-modals/shared-modal.service';
import { Language, Languages } from '../models/LanguagesCountries';
import { Project } from '../models/Project';
import { TranslationResult } from '../models/Search';
import { ShowVocUrlParams } from '../models/ShowVoc';
import { GlobalSearchServices } from '../services/global-search.service';
import { ProjectsServices } from '../services/projects.service';
import { ResourcesServices } from '../services/resources.service';
import { Cookie } from '../utils/Cookie';
import { SVContext } from '../utils/SVContext';

@Component({
    selector: 'translation-component',
    templateUrl: './translation.component.html',
    host: { class: "pageComponent" },
})
export class TranslationComponent {

    searchString: string;
    lastSearch: string;

    sourceLangs: Language[] = [];
    targetLangs: Language[] = [];

    caseSensitive: boolean;

    groupedResults: { [repId: string]: TranslationResult[] };

    loading: boolean = false;

    includeClosedDatasets: boolean = true;
    filteredRepoIds: string[]; //id (eventually filtered) of the repositories of the results, useful to iterate over them in the view

    resultsCount: number;
    excludedResultsCount: number; //results excluded due filters (currently just due the "only open" dataset filter)
    excludedRepoCount: number; //repo excluded due filters

    isSuperUser: boolean;
    superUserProjects: Project[];


    constructor(private globalSearchService: GlobalSearchServices, private resourcesService: ResourcesServices, private projectService: ProjectsServices,
        private basicModals: BasicModalsServices, private sharedModals: SharedModalsServices, private router: Router) { }

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
            this.translate();
        }
    }

    translate() {
        if (this.sourceLangs.length == 0) {
            this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "You need to select at least a source language" }, ModalType.warning);
            return;
        }
        if (this.targetLangs.length == 0) {
            this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "You need to select at least a target language" }, ModalType.warning);
            return;
        }

        this.lastSearch = this.searchString;
        this.loading = true;
        this.globalSearchService.translation(this.searchString, this.sourceLangs.map(l => l.tag), this.targetLangs.map(l => l.tag), this.caseSensitive).pipe(
            finalize(() => { this.loading = false; })
        ).subscribe(
            (results: TranslationResult[]) => {
                //group the results by repository ID 
                this.groupedResults = {};
                results.forEach(r => {
                    let resultsInRepo: TranslationResult[] = this.groupedResults[r.repository.id];
                    if (resultsInRepo != null) {
                        resultsInRepo.push(r);
                    } else {
                        this.groupedResults[r.repository.id] = [r];
                    }
                    /* 
                    post processing of response content:
                    - no need to show empty rows for those languages that don't have translations
                    - sort translation values with this order: skos:prefLabel, skos:altLabel, other predicates, skos:hiddenLabel
                    */
                    r.translations = r.translations.filter(t => t.values.some(v => v.type == "lexicalization")); //filter out from translations those elements which have no values
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
        Object.keys(this.groupedResults).forEach(repoId => {
            if (this.includeClosedDatasets || !this.includeClosedDatasets && this.groupedResults[repoId][0].repository.open) {
                this.filteredRepoIds.push(repoId);
                this.resultsCount += this.groupedResults[repoId].length;
            } else {
                this.excludedRepoCount++;
                this.excludedResultsCount += this.groupedResults[repoId].length;
            }
        });
        this.filteredRepoIds.sort();
    }

    /**
     * Tells if a given search result is accessible, namely if the repository/project (which the result belongs to) is open and,
     * in case of SuperUser, if user is authorized to access project
     * @param result
     */
    isResultAccessible(result: TranslationResult): boolean {
        //a result is clickable if the related repository is open AND, in case of super user, if the repository is a project for which SU has authorization
        return result.repository.open &&
            (!this.isSuperUser || this.superUserProjects.some(p => p.getName() == result.repository.id));

    }


    goToResource(result: TranslationResult) {
        this.router.navigate(["/datasets/" + result.repository.id + "/data"], { queryParams: { [ShowVocUrlParams.resId]: result.resource } });
    }

    goToDataset(repoId: string) {
        this.router.navigate(["/datasets/" + repoId]);
    }

    /**======================
     * Filters
     * ======================*/

    switchLangs() {
        let temp = this.sourceLangs.slice();
        this.sourceLangs = this.targetLangs;
        this.targetLangs = temp;
        this.updateCookies();
    }

    editSourceLangs() {
        this.sharedModals.selectLanguages({ key: "COMMONS.ACTIONS.SELECT_LANGUAGES" }, this.sourceLangs.map(l => l.tag)).then(
            (languages: string[]) => {
                this.sourceLangs = Languages.fromTagsToLanguages(languages);
                this.updateCookies();
            }
        );
    }

    editTargetLangs() {
        this.sharedModals.selectLanguages({ key: "COMMONS.ACTIONS.SELECT_LANGUAGES" }, this.targetLangs.map(l => l.tag)).then(
            (languages: string[]) => {
                this.targetLangs = Languages.fromTagsToLanguages(languages);
                this.updateCookies();
            }
        );
    }

    removeLang(langs: Language[], index: number) {
        langs.splice(index, 1);
        this.updateCookies();
    }

    onCaseSensitiveChange() {
        this.updateCookies();
        if (this.sourceLangs.length > 0 && this.targetLangs.length > 0 && this.searchString && this.searchString.trim().length > 0) {
            this.translate();
        }
    }

    //Projects

    disableClosedProjectFilter() {
        this.includeClosedDatasets = true;
        this.updateProjectFilter();
    }

    updateProjectFilter() {
        this.updateCookies();
        if (this.groupedResults) { //if search results are available, filter them
            this.filterSearchResults();
        }
    }





    private initCookies() {
        //Projects: only open
        this.includeClosedDatasets = Cookie.getCookie(Cookie.TRANSLATION_FILTERS_ONLY_OPEN_PROJECTS) == "true";
        //case sensitive
        this.caseSensitive = Cookie.getCookie(Cookie.TRANSLATION_CASE_SENSITIVE) == "true";
        //Languages
        let sourceLangsCookie = Cookie.getCookie(Cookie.TRANSLATION_SOURCE_LANGUAGES);
        if (sourceLangsCookie != null) {
            this.sourceLangs = JSON.parse(sourceLangsCookie);
        }
        let targetLangsCookie = Cookie.getCookie(Cookie.TRANSLATION_TARGET_LANGUAGES);
        if (targetLangsCookie != null) {
            this.targetLangs = JSON.parse(targetLangsCookie);
        }
    }
    private updateCookies() {
        Cookie.setCookie(Cookie.TRANSLATION_FILTERS_ONLY_OPEN_PROJECTS, this.includeClosedDatasets + "");
        Cookie.setCookie(Cookie.TRANSLATION_CASE_SENSITIVE, this.caseSensitive + "");
        Cookie.setCookie(Cookie.TRANSLATION_SOURCE_LANGUAGES, JSON.stringify(this.sourceLangs));
        Cookie.setCookie(Cookie.TRANSLATION_TARGET_LANGUAGES, JSON.stringify(this.targetLangs));

    }

}