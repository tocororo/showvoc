import { Component, ElementRef, ViewChild } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { BrowsingModalsServices } from 'src/app/modal-dialogs/browsing-modals/browsing-modal.service';
import { CreationModalServices } from 'src/app/modal-dialogs/creation-modals/creationModalServices';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { SearchMode, SearchSettings, StatusFilter } from 'src/app/models/Properties';
import { AnnotatedValue, IRI, Literal, RDFTypesEnum, Resource, Value } from 'src/app/models/Resources';
import { OntoLex, SKOS } from 'src/app/models/Vocabulary';
import { SearchServices } from 'src/app/services/search.service';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { SVContext } from 'src/app/utils/SVContext';

@Component({
    selector: "advanced-search-modal",
    templateUrl: "./advanced-search-modal.html"
})
export class AdvancedSearchModal {

    @ViewChild('blockingDiv', { static: true }) public blockingDivElement: ElementRef;

    loading: boolean;

    searchString: string;

    statuses: { show: string, value: StatusFilter }[] = [
        { show: "Anything", value: StatusFilter.ANYTHING },
        { show: "Not deprecated", value: StatusFilter.NOT_DEPRECATED },
        { show: "Only deprecated", value: StatusFilter.ONLY_DEPRECATED }
    ];
    selectedStatus: StatusFilter = this.statuses[0].value;

    //search mode use URI/LocalName
    useURI: boolean = true;
    useLocalName: boolean = true;
    useNotes: boolean = true;

    stringMatchModes: { labelTranslationKey: string, value: SearchMode }[] = [
        { labelTranslationKey: "SEARCH.SETTINGS.STARTS_WITH", value: SearchMode.startsWith },
        { labelTranslationKey: "SEARCH.SETTINGS.CONTAINS", value: SearchMode.contains },
        { labelTranslationKey: "SEARCH.SETTINGS.ENDS_WITH", value: SearchMode.endsWith },
        { labelTranslationKey: "SEARCH.SETTINGS.EXACT", value: SearchMode.exact },
        { labelTranslationKey: "SEARCH.SETTINGS.FUZZY", value: SearchMode.fuzzy }
    ];
    activeStringMatchMode: SearchMode;


    restrictLang: boolean = false;
    includeLocales: boolean = false;
    languages: string[];

    //types
    typesGroups: AnnotatedValue<IRI>[][] = [];

    //schemes
    showSchemeSelector: boolean = false;
    private schemesGroups: AnnotatedValue<IRI>[][] = [];

    //ingoing/outgoing links
    ingoingLinks: { first: AnnotatedValue<IRI>, second: AnnotatedValue<Value>[] }[] = []; //first is the property, second is a list of values
    outgoingLinksValue: { first: AnnotatedValue<IRI>, second: AnnotatedValue<Value>[] }[] = [];
    outgoingLinksFreeText: { predicate: AnnotatedValue<IRI>, searchString: string, mode: SearchMode }[] = [];

    constructor(public activeModal: NgbActiveModal, private searchService: SearchServices,
        private basicModals: BasicModalsServices, private sharedModals: SharedModalsServices, private browsingModals: BrowsingModalsServices,
        private creationModals: CreationModalServices, private translateService: TranslateService) { }

    ngOnInit() {
        let searchSettings: SearchSettings = SVContext.getProjectCtx().getProjectPreferences().searchSettings;
        this.useLocalName = searchSettings.useLocalName;
        this.useURI = searchSettings.useURI;
        this.useNotes = searchSettings.useNotes;

        this.activeStringMatchMode = searchSettings.stringMatchMode;

        this.restrictLang = searchSettings.restrictLang;
        this.includeLocales = searchSettings.includeLocales;
        this.languages = searchSettings.languages;

        let modelType: string = SVContext.getWorkingProject().getModelType();
        this.showSchemeSelector = modelType == SKOS.uri || modelType == OntoLex.uri;
    }

    selectRestrictionLanguages() {
        this.sharedModals.selectLanguages({ key: "COMMONS.ACTIONS.SELECT_LANGUAGES" }, this.languages, false, true).then(
            (langs: string[]) => {
                this.languages = langs;
            },
            () => { }
        );
    }

    /** ===================== 
     * Types management
     * ===================== */

    addTypesGroup() {
        this.typesGroups.push([]);
    }

    deleteTypesGroup(index: number) {
        this.typesGroups.splice(index, 1);
    }

    addType(group: AnnotatedValue<IRI>[]) {
        this.browsingModals.browseClassTree({ key: "DATA.ACTIONS.SELECT_CLASS" }).then(
            (type: AnnotatedValue<IRI>) => {
                group.push(type);
            },
            () => {}
        );
    }

    deleteType(group: AnnotatedValue<IRI>[], index: number) {
        group.splice(index, 1);
    }

    updateType(group: AnnotatedValue<IRI>[], index: number, type: AnnotatedValue<IRI>) {
        group[index] = type;
    }


    /** ===================== 
     * Schemes management
     * ===================== */

    addSchemesGroup() {
        this.schemesGroups.push([]);
    }

    deleteSchemesGroup(index: number) {
        this.schemesGroups.splice(index, 1);
    }

    addScheme(group: AnnotatedValue<IRI>[]) {
        this.browsingModals.browseSchemeList({ key: "DATA.ACTIONS.SELECT_SCHEME" }).then(
            (scheme: AnnotatedValue<IRI>) => {
                group.push(scheme);
            },
            () => {}
        );
    }

    deleteScheme(group: AnnotatedValue<IRI>[], index: number) {
        group.splice(index, 1);
    }

    updateScheme(group: AnnotatedValue<IRI>[], index: number, scheme: AnnotatedValue<IRI>) {
        group[index] = scheme;
    }

    /** ===================== 
     * Ingoing links management
     * ===================== */

    addIngoingGroup() {
        this.ingoingLinks.push({ first: null, second: [] });
    }

    deleteIngoingGroup(index: number) {
        this.ingoingLinks.splice(index, 1);
    }

    updatePropIngoing(group: { first: AnnotatedValue<IRI>, second: AnnotatedValue<Value>[] }, property: AnnotatedValue<IRI>) {
        group.first = property;
    }

    addIngoingValue(group: { first: AnnotatedValue<IRI>, second: AnnotatedValue<Value>[] }) {
        this.sharedModals.pickResource({ key: "COMMONS.ACTIONS.SELECT_RESOURCE" }).then(
            (value: AnnotatedValue<Value>) => {
                group.second.push(value);
            },
            () => { }
        );
    }

    deleteIngoingValue(group: { first: AnnotatedValue<IRI>, second: AnnotatedValue<Value>[] }, index: number) {
        group.second.splice(index, 1);
    }

    updateIngoingValue(group: { first: AnnotatedValue<IRI>, second: AnnotatedValue<Value>[] }, index: number, value: AnnotatedValue<Value>) {
        group.second[index] = value;
    }

    /** ===================== 
     * Outgoing links management value
     * ===================== */

    addOutgoingGroupValue() {
        this.outgoingLinksValue.push({ first: null, second: [] });
    }

    deleteOutgoingGroupValue(index: number) {
        this.outgoingLinksValue.splice(index, 1);
    }

    updatePropOutgoingValue(group: { first: AnnotatedValue<IRI>, second: AnnotatedValue<Value>[] }, property: AnnotatedValue<IRI>) {
        group.first = property;
    }

    addOutgoingValue(group: { first: AnnotatedValue<IRI>, second: AnnotatedValue<Value>[] }, type: RDFTypesEnum) {
        if (type == RDFTypesEnum.resource) {
            this.sharedModals.pickResource({ key: "COMMONS.ACTIONS.SELECT_RESOURCE" }).then(
                (value: AnnotatedValue<Value>) => {
                    group.second.push(value);
                },
                () => { }
            );
        } else if (type == RDFTypesEnum.literal) {
            this.creationModals.newTypedLiteral({ key: "DATA.ACTIONS.CREATE_LITERAL" }).then(
                (value: AnnotatedValue<Literal>) => {
                    group.second.push(value);
                },
                () => { }
            );
        }
    }

    deleteOutgoingValue(group: { first: AnnotatedValue<IRI>, second: AnnotatedValue<Value>[] }, index: number) {
        group.second.splice(index, 1);
    }

    updateOutgoingValue(group: { first: AnnotatedValue<IRI>, second: AnnotatedValue<Value>[] }, index: number, value: AnnotatedValue<Value>) {
        group.second[index] = value;
    }

    /** ===================== 
     * Outgoing links management free text
     * ===================== */

    addOutgoingGroupFreeText() {
        this.outgoingLinksFreeText.push({ predicate: null, searchString: null, mode: SVContext.getProjectCtx().getProjectPreferences().searchSettings.stringMatchMode });
    }

    deleteOutgoingGroupFreeText(index: number) {
        this.outgoingLinksFreeText.splice(index, 1);
    }

    updatePropOutgoingFreeText(group: { predicate: AnnotatedValue<IRI>, searcString: string, mode: SearchMode }, property: AnnotatedValue<IRI>) {
        group.predicate = property;
    }

    //---------------------


    ok() {
        let langsPar: string[];
        let includeLocalesPar: boolean;
        if (this.restrictLang) {
            langsPar = this.languages;
            includeLocalesPar = this.includeLocales;
        }

        let typesParam: IRI[][] = [];
        this.typesGroups.forEach((group: AnnotatedValue<IRI>[]) => {
            let g: IRI[] = [];
            group.forEach((type: AnnotatedValue<IRI>) => {
                if (type != null) { //ignore groups with null elements
                    g.push(type.getValue());
                }
            });
            if (g.length > 0) {
                typesParam.push(g);
            }
        });
        if (typesParam.length == 0) {
            typesParam = null;
        }

        let schemesParam: IRI[][] = [];
        this.schemesGroups.forEach((group: AnnotatedValue<IRI>[]) => {
            let g: IRI[] = [];
            group.forEach((scheme: AnnotatedValue<IRI>) => {
                if (scheme != null) { //ignore groups with null elements
                    g.push(scheme.getValue());
                }
            });
            if (g.length > 0) {
                schemesParam.push(g);
            }
        });
        if (schemesParam.length == 0) {
            schemesParam = null;
        }

        //filter out links without property or with null values
        let incompleteIngoingLinksFilter: boolean;
        let ingoingLinksParam: { first: IRI, second: Value[] }[] = [];
        this.ingoingLinks.forEach((pair: { first: AnnotatedValue<IRI>, second: AnnotatedValue<Value>[] }) => {
            let predicate = pair.first;
            let values: Value[] = [];
            pair.second.forEach((v: AnnotatedValue<Value>) => {
                if (v != null) {
                    values.push(v.getValue());
                }
            });
            if (predicate != null && values.length != 0) { //filter ok
                ingoingLinksParam.push({ first: pair.first.getValue(), second: values });
            } else if (predicate != null && values.length == 0 || predicate == null && values.length != 0) {
                //incomplete filter: provided predicate but not values, or provided values but not predicate
                incompleteIngoingLinksFilter = true;
            } //other cases (empty filters) are ignored
        });
        if (incompleteIngoingLinksFilter) {
            this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "SEARCH.ADV_SEARCH.INCOMPLETE_FILTER_WARN", params: { filter: this.translateService.instant("SEARCH.ADV_SEARCH.INGOING_LINKS") }}, ModalType.warning);
            return;
        }
        if (ingoingLinksParam.length == 0) {
            ingoingLinksParam = null;
        }


        let incompleteOutgoingLinksFilter: boolean;
        let outgoingLinksParam: { first: IRI, second: Value[] }[] = [];
        this.outgoingLinksValue.forEach((pair: { first: AnnotatedValue<IRI>, second: AnnotatedValue<Value>[] }) => {
            let predicate = pair.first;
            let values: Value[] = [];
            pair.second.forEach((v: AnnotatedValue<Value>) => {
                if (v != null) {
                    values.push(v.getValue());
                }
            });
            if (predicate != null && values.length != 0) { //filter ok
                outgoingLinksParam.push({ first: pair.first.getValue(), second: values });
            } else if (predicate != null && values.length == 0 || predicate == null && values.length != 0) {
                //incomplete filter: provided predicate but not values, or provided values but not predicate
                incompleteOutgoingLinksFilter = true;
            } //other cases (empty filters) are ignored
        });
        if (incompleteOutgoingLinksFilter) {
            this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "SEARCH.ADV_SEARCH.INCOMPLETE_FILTER_WARN", params: { filter: this.translateService.instant("SEARCH.ADV_SEARCH.OUTGOING_LINKS") }}, ModalType.warning);
            return;
        }
        if (outgoingLinksParam.length == 0) {
            outgoingLinksParam = null;
        }

        let incompleteOutgoingSearchFilter: boolean;
        let outgoingSearchParam: { predicate: IRI, searchString: string, mode: SearchMode }[] = [];
        this.outgoingLinksFreeText.forEach((triple: { predicate: AnnotatedValue<IRI>, searchString: string, mode: SearchMode }) => {
            if (triple.predicate != null && triple.searchString != null && triple.searchString.trim() != "") {
                outgoingSearchParam.push({ predicate: triple.predicate.getValue(), searchString: triple.searchString, mode: triple.mode });
            } else if (
                (triple.predicate != null && (triple.searchString == null || triple.searchString.trim() == "")) || //predicate provided, value null
                (triple.predicate == null && triple.searchString != null && triple.searchString.trim() != "") //value provided, predicate null
            ) {
                incompleteOutgoingSearchFilter = true;
            } //other cases (empty filters) are ignored
        });
        if (incompleteOutgoingSearchFilter) {
            this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "SEARCH.ADV_SEARCH.INCOMPLETE_FILTER_WARN", params: { filter: this.translateService.instant("SEARCH.ADV_SEARCH.OUTGOING_LINKS") }}, ModalType.warning);
            return;
        }
        if (outgoingSearchParam.length == 0) {
            outgoingSearchParam = null;
        }

        this.loading = true;
        this.searchService.advancedSearch(this.searchString, this.useLocalName, this.useURI, this.useNotes, this.activeStringMatchMode,
            this.selectedStatus, langsPar, includeLocalesPar, typesParam, schemesParam, ingoingLinksParam, outgoingLinksParam, outgoingSearchParam).subscribe(
                searchResult => {
                    this.loading = false;
                    if (searchResult.length == 0) {
                        this.basicModals.alert({ key: "SEARCH.SEARCH" }, { key: "MESSAGES.NO_RESULTS_FOUND" }, ModalType.warning);
                    } else { //1 or more results
                        ResourceUtils.sortResources(searchResult, SortAttribute.show);
                        this.sharedModals.selectResource({ key: "SEARCH.SEARCH" }, { key: "MESSAGES.X_SEARCH_RESOURCES_FOUND", params: { results: searchResult.length } }, searchResult, true).then(
                            (selectedResources: AnnotatedValue<Resource>[]) => {
                                this.activeModal.close(selectedResources[0]);
                            },
                            () => { }
                        );
                    }
                }
            );

    }

    close() {
        this.activeModal.dismiss();
    }

}