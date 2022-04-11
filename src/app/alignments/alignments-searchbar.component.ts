import { Component, Input, SimpleChanges } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { concat, Observable } from 'rxjs';
import { finalize, map, toArray } from 'rxjs/operators';
import { ModalOptions } from '../modal-dialogs/Modals';
import { SearchMode, SearchSettings, StatusFilter } from '../models/Properties';
import { AnnotatedValue, Resource } from '../models/Resources';
import { TripleForSearch } from '../models/Search';
import { SearchServices } from '../services/search.service';
import { SearchSettingsModal } from '../structures/search-bar/search-settings-modal';
import { Cookie } from '../utils/Cookie';
import { HttpServiceContext } from '../utils/HttpManager';
import { ProjectContext } from '../utils/SVContext';
import { SVProperties } from '../utils/SVProperties';
import { AlignmentsSearchResultsModal } from './modals/alignments-search-results-modal';

@Component({
    selector: 'alignments-searchbar',
    templateUrl: './alignments-searchbar.component.html',
})
export class AlignmentsSearchbar {

    @Input() sourceCtx: ProjectContext;
    @Input() targetCtx: ProjectContext;

    @Input() targetNs: string; //namespace of the target dataset (useful for the search: resources in source dataset aligned with resources startingWith such ns)

    //search
    searchLoading: boolean;
    searchStr: string;
    searchSettings: SearchSettings = new SearchSettings(); //init just to prevented error on UI
    stringMatchModes: { labelTranslationKey: string, value: SearchMode, symbol: string }[] = [
        { labelTranslationKey: "SEARCH.SETTINGS.STARTS_WITH", value: SearchMode.startsWith, symbol: "α.." },
        { labelTranslationKey: "SEARCH.SETTINGS.CONTAINS", value: SearchMode.contains, symbol: ".α." },
        { labelTranslationKey: "SEARCH.SETTINGS.ENDS_WITH", value: SearchMode.endsWith, symbol: "..α" },
        { labelTranslationKey: "SEARCH.SETTINGS.EXACT", value: SearchMode.exact, symbol: "α" },
        { labelTranslationKey: "SEARCH.SETTINGS.FUZZY", value: SearchMode.fuzzy, symbol: "~α" }
    ];

    targetDatasetAvailable: boolean; //tells if the target dataset has a related project (useful to enable/disable search on target dataset)
    datasetSearchModes: { labelTranslationKey: string, value: DatasetSearchMode, symbol: string }[] = [
        { labelTranslationKey: "ALIGNMENTS.SEARCH.MODE_ONLY_SOURCE", value: DatasetSearchMode.onlySource, symbol: "fas fa-long-arrow-alt-left" },
        { labelTranslationKey: "ALIGNMENTS.SEARCH.MODE_BOTH", value: DatasetSearchMode.both, symbol: "fas fa-arrows-alt-h" },
    ];
    datasetSearchMode: DatasetSearchMode = DatasetSearchMode.onlySource;

    constructor(private searchService: SearchServices, private svProps: SVProperties, private modalService: NgbModal) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['sourceCtx'] || changes['targetCtx']) {
            this.initSearch();
        }
    }

    initSearch() {
        this.searchSettings = this.sourceCtx.getProjectPreferences().searchSettings;

        let searchDatasetModeCookie = Cookie.getCookie(Cookie.ALIGNMENT_SEARCH_DATASET_MODE);
        if (searchDatasetModeCookie in DatasetSearchMode) {
            this.datasetSearchMode = <DatasetSearchMode>searchDatasetModeCookie;
        }

        //check if target dataset has a project in ShowVoc. If not, lock the dataset search mode to "OnlySource"
        this.targetDatasetAvailable = this.targetCtx != null;
        if (!this.targetDatasetAvailable) {
            this.datasetSearchMode = DatasetSearchMode.onlySource;
        }
    }

    openSearchSettings() {
        const modalRef: NgbModalRef = this.modalService.open(SearchSettingsModal, new ModalOptions());
        modalRef.componentInstance.projectCtx = this.sourceCtx;
        modalRef.componentInstance.roles = [];
        return modalRef.result;
    }

    doSearch() {
        if (this.searchStr == null || this.searchStr.trim() == "") return;

        let inTarget: boolean = this.datasetSearchMode == DatasetSearchMode.both;
        let sourceDatasetResults: AnnotatedValue<Resource>[];
        let targetDatasetResults: AnnotatedValue<Resource>[];

        let searchFn: Observable<void>[] = [];

        searchFn.push(this.searchInSource().pipe(
            map(results => {
                sourceDatasetResults = results;
            })
        ));
        if (inTarget) {
            searchFn.push(this.searchInTarget().pipe(
                map(results => {
                    targetDatasetResults = results;
                })
            ));
        }

        this.searchLoading = true;
        concat(...searchFn).pipe(
            toArray(),
            finalize(() => { this.searchLoading = false; })
        ).subscribe(() => {
            const modalRef: NgbModalRef = this.modalService.open(AlignmentsSearchResultsModal, new ModalOptions('lg'));
            modalRef.componentInstance.sourceProject = this.sourceCtx.getProject();
            modalRef.componentInstance.targetProject = this.targetDatasetAvailable ? this.targetCtx.getProject() : null;
            modalRef.componentInstance.sourceResults = sourceDatasetResults;
            modalRef.componentInstance.targetResults = targetDatasetResults;
        });
    }

    private searchInSource(): Observable<AnnotatedValue<Resource>[]> {
        let outgoingSearch: TripleForSearch = { predicate: null, searchString: this.targetNs, mode: SearchMode.startsWith };
        HttpServiceContext.setContextProject(this.sourceCtx.getProject());
        return this.searchService.advancedSearch(this.searchStr, this.searchSettings.useLocalName, this.searchSettings.useURI,
            this.searchSettings.useNotes, this.searchSettings.stringMatchMode, StatusFilter.ANYTHING, null, null, null, null, null, null, [outgoingSearch]).pipe(
                finalize(() => {
                    HttpServiceContext.removeContextProject();
                })
            );
    }

    private searchInTarget(): Observable<AnnotatedValue<Resource>[]> {
        HttpServiceContext.setConsumerProject(this.sourceCtx.getProject());
        HttpServiceContext.setContextProject(this.targetCtx.getProject());
        return this.searchService.searchAlignedResources(this.searchStr, this.searchSettings.useLocalName, this.searchSettings.useURI, this.searchSettings.stringMatchMode,
            this.searchSettings.useNotes).pipe(
                finalize(() => {
                    HttpServiceContext.removeConsumerProject();
                    HttpServiceContext.removeContextProject();
                })
            );
    }

    updateSearchMode(mode: SearchMode, event: Event) {
        event.stopPropagation();
        this.searchSettings.stringMatchMode = mode;
        this.svProps.setSearchSettings(this.sourceCtx, this.searchSettings);
    }

    updateDatasetSearchMode(mode: DatasetSearchMode, event: Event) {
        event.stopPropagation();
        this.datasetSearchMode = mode;
        Cookie.setCookie(Cookie.ALIGNMENT_SEARCH_DATASET_MODE, mode);
    }

}

enum DatasetSearchMode {
    onlySource = "onlySource",
    both = "both"
}