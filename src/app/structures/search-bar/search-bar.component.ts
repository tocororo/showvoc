import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalOptions, ModalType } from 'src/app/modal-dialogs/Modals';
import { SearchMode, SearchSettings } from 'src/app/models/Properties';
import { AnnotatedValue, IRI, RDFResourceRolesEnum, Resource } from 'src/app/models/Resources';
import { SearchServices } from 'src/app/services/search.service';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { SearchSettingsModal } from './search-settings-modal';

@Component({
    selector: "search-bar",
    templateUrl: "./search-bar.component.html",
    styles: [".dropdown-toggle::after { display:none; }"]
})
export class SearchBarComponent {

    @Input() role: RDFResourceRolesEnum; //tells the role of the panel where the search bar is placed (usefull for customizing the settings)
    @Input() disabled: boolean = false;
    @Input() schemes: IRI[]; //if search-bar is in the conceptTreePanel
    @Input() lexicon: IRI; //if search-bar is in the lexicalEntryListPanel
    @Output() searchResults: EventEmitter<AnnotatedValue<Resource>[]> = new EventEmitter();

    loading: boolean = false;

    //search mode startsWith/contains/endsWith
    stringMatchModes: { show: string, value: SearchMode, symbol: string }[] = [
        { show: "Starts with", value: SearchMode.startsWith, symbol: "α.." },
        { show: "Contains", value: SearchMode.contains, symbol: ".α." },
        { show: "Ends with", value: SearchMode.endsWith, symbol: "..α" },
        { show: "Exact", value: SearchMode.exact, symbol: "α" },
        { show: "Fuzzy", value: SearchMode.fuzzy, symbol: "~α" }
    ];

    searchSettings: SearchSettings;

    searchStr: string;
    private lastSearch: string;

    private eventSubscriptions: Subscription[] = [];

    constructor(private searchService: SearchServices, private pmkiProps: PMKIProperties, private eventHandler: PMKIEventHandler, 
        private basicModals: BasicModalsServices, private modalService: NgbModal) {

        this.eventSubscriptions.push(eventHandler.searchPrefsUpdatedEvent.subscribe(
            () => this.updateSearchSettings()));
    }

    ngOnInit() {
        this.searchSettings = this.pmkiProps.getSearchSettings();
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    doSearch() {
        if (this.searchStr != undefined && this.searchStr.trim() != "") {
            this.lastSearch = this.searchStr;
            this.doSearchImpl();
        } else {
            this.basicModals.alert("Search", "Please enter a valid string to search", ModalType.warning);
        }
    }

    public doSearchImpl() {
        if (this.lastSearch == null) return; //prevent error in case search is forced from a parent panel (e.g. concept tree in search based mode)

        let searchLangs: string[];
        let includeLocales: boolean;
        // if (this.searchSettings.restrictLang) {
        //     searchLangs = this.searchSettings.languages;
        //     includeLocales = this.searchSettings.includeLocales;
        // }
        let searchingScheme: IRI[] = [];
        if (this.role == RDFResourceRolesEnum.concept && this.searchSettings.restrictActiveScheme) {
            searchingScheme = this.schemes;
        }

        let searchFn: Observable<AnnotatedValue<Resource>[]>;
        if (this.role == RDFResourceRolesEnum.ontolexLexicalEntry) {
            searchFn = this.searchService.searchLexicalEntry(this.lastSearch, this.searchSettings.useLocalName, this.searchSettings.useURI,
                this.searchSettings.useNotes, this.searchSettings.stringMatchMode, [this.lexicon], searchLangs, includeLocales);
        } else {
            searchFn = this.searchService.searchResource(this.lastSearch, [this.role], this.searchSettings.useLocalName, 
                this.searchSettings.useURI, this.searchSettings.useNotes, this.searchSettings.stringMatchMode, searchLangs,
                includeLocales, searchingScheme);
        }

        this.loading = true;
        searchFn.subscribe(
            searchResult => {
                this.loading = false;
                if (searchResult.length == 0) {
                    this.basicModals.alert("Search", "No results found for '" + this.lastSearch + "'", ModalType.warning);
                } else {
                    this.searchResults.emit(searchResult);
                }
            }
        );
    }

    settings() {
		const modalRef: NgbModalRef = this.modalService.open(SearchSettingsModal, new ModalOptions() );
        modalRef.componentInstance.role = this.role;
        return modalRef.result;
    }

    private updateSearchMode(mode: SearchMode, event: Event) {
        event.stopPropagation();
        this.searchSettings.stringMatchMode = mode;
        this.pmkiProps.setSearchSettings(this.searchSettings);
    }

    /**
     * When the search settings is updated, updates the setting of the bar and the settings for the autocompleter
     */
    private updateSearchSettings() {
        this.searchSettings = this.pmkiProps.getSearchSettings();
    }

}