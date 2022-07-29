import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalOptions, ModalType } from 'src/app/modal-dialogs/Modals';
import { SearchMode, SearchSettings, ClassIndividualPanelSearchMode } from 'src/app/models/Properties';
import { AnnotatedValue, IRI, RDFResourceRolesEnum, Resource } from 'src/app/models/Resources';
import { SearchServices } from 'src/app/services/search.service';
import { SVEventHandler } from 'src/app/utils/SVEventHandler';
import { SVProperties } from 'src/app/utils/SVProperties';
import { SearchSettingsModal } from './search-settings-modal';
import { finalize } from 'rxjs/operators';
import { SVContext } from 'src/app/utils/SVContext';
import { AdvancedSearchModal } from './advanced-search-modal';
import { TreeListContext } from 'src/app/utils/UIUtils';

@Component({
    selector: "search-bar",
    templateUrl: "./search-bar.component.html"
})
export class SearchBarComponent {

    @Input() roles: RDFResourceRolesEnum[]; //tells the role of the panel where the search bar is placed (usefull for customizing the settings)
    @Input() disabled: boolean = false;
    @Input() schemes: IRI[]; //if search-bar is in the conceptTreePanel
    @Input() lexicon: IRI; //if search-bar is in the lexicalEntryListPanel
    @Input() cls: IRI; //if search-bar is in the instanceListPanel
    @Output() searchResults: EventEmitter<AnnotatedValue<Resource>[]> = new EventEmitter();
    @Output() advancedSearchResult: EventEmitter<AnnotatedValue<Resource>> = new EventEmitter();
    @Input() context: TreeListContext;

    loading: boolean = false;

    //search mode startsWith/contains/endsWith
    stringMatchModes: { labelTranslationKey: string, value: SearchMode, symbol: string }[] = [
        { labelTranslationKey: "SEARCH.SETTINGS.STARTS_WITH", value: SearchMode.startsWith, symbol: "α.." },
        { labelTranslationKey: "SEARCH.SETTINGS.CONTAINS", value: SearchMode.contains, symbol: ".α." },
        { labelTranslationKey: "SEARCH.SETTINGS.ENDS_WITH", value: SearchMode.endsWith, symbol: "..α" },
        { labelTranslationKey: "SEARCH.SETTINGS.EXACT", value: SearchMode.exact, symbol: "α" },
        { labelTranslationKey: "SEARCH.SETTINGS.FUZZY", value: SearchMode.fuzzy, symbol: "~α" }
    ];

    searchSettings: SearchSettings;

    searchStr: string;
    private lastSearch: string;

    private eventSubscriptions: Subscription[] = [];

    constructor(private searchService: SearchServices, private svProps: SVProperties, private eventHandler: SVEventHandler,
        private basicModals: BasicModalsServices, private modalService: NgbModal) {

        this.eventSubscriptions.push(eventHandler.searchPrefsUpdatedEvent.subscribe(
            () => this.updateSearchSettings()));
    }

    ngOnInit() {
        this.searchSettings = SVContext.getProjectCtx().getProjectPreferences().searchSettings;
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    doSearch() {
        if (this.searchStr != undefined && this.searchStr.trim() != "") {
            this.lastSearch = this.searchStr;
            this.doSearchImpl();
        } else {
            this.basicModals.alert({ key: "COMMONS.ACTIONS.SEARCH" }, { key: "MESSAGES.INVALID_SEARCH_STRING" }, ModalType.warning);
        }
    }

    public doSearchImpl() {
        if (this.lastSearch == null) return; //prevent error in case search is forced from a parent panel (e.g. concept tree in search based mode)

        let searchLangs: string[];
        let includeLocales: boolean;
        let searchingScheme: IRI[] = [];
        if (this.roles.length == 1 && this.roles[0] == RDFResourceRolesEnum.concept && this.searchSettings.restrictActiveScheme) {
            searchingScheme = this.schemes;
        }

        let searchFn: Observable<AnnotatedValue<Resource>[]>;
        if (this.roles.length == 1 && this.roles[0] == RDFResourceRolesEnum.ontolexLexicalEntry) { //bar in lexical entry panel
            searchFn = this.searchService.searchLexicalEntry(this.lastSearch, this.searchSettings.useLocalName, this.searchSettings.useURI,
                this.searchSettings.useNotes, this.searchSettings.stringMatchMode, [this.lexicon], searchLangs, includeLocales);
        } else if (this.roles.length == 1 && this.roles[0] == RDFResourceRolesEnum.individual) { //bar in instances panel
            searchFn = this.searchService.searchInstancesOfClass(this.cls, this.lastSearch, this.searchSettings.useLocalName, this.searchSettings.useURI,
                this.searchSettings.useNotes, this.searchSettings.stringMatchMode, searchLangs, includeLocales);
        } else if (this.roles.length == 2 && this.roles.indexOf(RDFResourceRolesEnum.cls) != -1 && this.roles.indexOf(RDFResourceRolesEnum.individual) != -1) { //panel in cls-instance panel
            let searchRoles: RDFResourceRolesEnum[] = [RDFResourceRolesEnum.individual, RDFResourceRolesEnum.cls]; //by default search both
            if (this.searchSettings.classIndividualSearchMode == ClassIndividualPanelSearchMode.onlyInstances) {
                searchRoles = [RDFResourceRolesEnum.individual];
            } else if (this.searchSettings.classIndividualSearchMode == ClassIndividualPanelSearchMode.onlyClasses) {
                searchRoles = [RDFResourceRolesEnum.cls];
            }
            searchFn = this.searchService.searchResource(this.lastSearch, searchRoles, this.searchSettings.useLocalName,
                this.searchSettings.useURI, this.searchSettings.useNotes, this.searchSettings.stringMatchMode, searchLangs,
                includeLocales);
        } else { //concept
            searchFn = this.searchService.searchResource(this.lastSearch, this.roles, this.searchSettings.useLocalName,
                this.searchSettings.useURI, this.searchSettings.useNotes, this.searchSettings.stringMatchMode, searchLangs,
                includeLocales, searchingScheme);
        }

        this.loading = true;
        searchFn.pipe(
            finalize(() => { this.loading = false; })
        ).subscribe(
            searchResult => {
                if (searchResult.length == 0) {
                    this.basicModals.alert({ key: "COMMONS.ACTIONS.SEARCH" }, { key: "MESSAGES.NO_RESULTS_FOUND_FOR", params: { searchedString: this.lastSearch } }, ModalType.warning);
                } else {
                    this.searchResults.emit(searchResult);
                }
            }
        );
    }

    advancedSearch() {
        const modalRef: NgbModalRef = this.modalService.open(AdvancedSearchModal, new ModalOptions('xl'));
        modalRef.result.then(
            (resource: AnnotatedValue<Resource>) => {
                this.advancedSearchResult.emit(resource);
            },
            () => { }
        );
    }

    settings() {
        const modalRef: NgbModalRef = this.modalService.open(SearchSettingsModal, new ModalOptions());
        modalRef.componentInstance.roles = this.roles;
        return modalRef.result;
    }

    updateSearchMode(mode: SearchMode, event: Event) {
        event.stopPropagation();
        this.searchSettings.stringMatchMode = mode;
        this.svProps.setSearchSettings(SVContext.getProjectCtx(), this.searchSettings);
    }

    /**
     * When the search settings is updated, updates the setting of the bar and the settings for the autocompleter
     */
    private updateSearchSettings() {
        this.searchSettings = SVContext.getProjectCtx().getProjectPreferences().searchSettings;
    }

}