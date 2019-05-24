import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { Language, Languages } from '../models/LanguagesCountries';
import { ConceptTreePreference, ConceptTreeVisualizationMode, LexEntryVisualizationMode, LexicalEntryListPreference, Properties, ResViewPartitionFilterPreference, SearchMode, SearchSettings, ValueFilterLanguages } from '../models/Properties';
import { IRI } from '../models/Resources';
import { PreferencesSettingsServices } from '../services/preferences-settings.service';
import { Cookie } from './Cookie';
import { PMKIEventHandler } from './PMKIEventHandler';

@Injectable()
export class PMKIProperties {

    private projectLanguagesSetting: Language[] = []; //all available languages in a project (settings)

    private filterValueLang: ValueFilterLanguages; //languages visible in resource description (e.g. in ResourceView, Graph,...)

    private activeSchemes: IRI[] = [];
    private activeLexicon: IRI;
    private showFlags: boolean = true;

    private conceptTreePreferences: ConceptTreePreference;
    private lexEntryListPreferences: LexicalEntryListPreference;

    //graph preferences
    private resViewPartitionFilter: ResViewPartitionFilterPreference;
    private hideLiteralGraphNodes: boolean = false;

    private searchSettings: SearchSettings = {
        stringMatchMode: SearchMode.startsWith,
        useLocalName: true,
        useURI: false,
        useNotes: false,
        restrictLang: false,
        includeLocales: false,
        languages: [],
        useAutocompletion: false,
        restrictActiveScheme: true
    };


    constructor(private prefService: PreferencesSettingsServices, private basicModals: BasicModalsServices, private eventHandler: PMKIEventHandler) {
    }

    /* =============================
    ========= PREFERENCES ==========
    ============================= */

    /**
     * To call each time the user change project
     */
    initUserProjectPreferences(): Observable<void> {
        var properties: string[] = [
            Properties.pref_active_schemes, Properties.pref_active_lexicon, Properties.pref_show_flags,
            Properties.pref_concept_tree_visualization,
            Properties.pref_lex_entry_list_visualization, Properties.pref_lex_entry_list_index_lenght,
            Properties.pref_search_languages, Properties.pref_search_restrict_lang,
            Properties.pref_search_include_locales, Properties.pref_search_use_autocomplete,
            Properties.pref_filter_value_languages, Properties.pref_res_view_partition_filter, Properties.pref_hide_literal_graph_nodes
        ];
        return this.prefService.getPUSettings(properties).pipe(
            map(prefs => {
                let activeSchemes = [];
                let activeSchemesPref: string = prefs[Properties.pref_active_schemes];
                if (activeSchemesPref != null) {
                    let skSplitted: string[] = activeSchemesPref.split(",");
                    for (var i = 0; i < skSplitted.length; i++) {
                        activeSchemes.push(new IRI(skSplitted[i]));
                    }
                }
                this.setActiveSchemes(activeSchemes);

                let activeLexicon = null;
                let activeLexiconPref: string = prefs[Properties.pref_active_lexicon];
                if (activeLexiconPref != null) {
                    activeLexicon = new IRI(activeLexiconPref);
                    this.setActiveLexicon(activeLexicon);
                }

                this.showFlags = prefs[Properties.pref_show_flags] == "true";

                let filterValueLangPref = prefs[Properties.pref_filter_value_languages];
                if (filterValueLangPref == null) {
                    this.filterValueLang = { languages: [], enabled: false }; //default
                } else {
                    this.filterValueLang = JSON.parse(filterValueLangPref);
                }

                //graph preferences
                let rvPartitionFilterPref = prefs[Properties.pref_res_view_partition_filter];
                if (rvPartitionFilterPref != null) {
                    this.resViewPartitionFilter = JSON.parse(rvPartitionFilterPref);
                } else {
                    this.resViewPartitionFilter = {};
                }

                this.hideLiteralGraphNodes = prefs[Properties.pref_hide_literal_graph_nodes] == "true";

                //concept tree preferences
                this.conceptTreePreferences = {
                    // baseBroaderUri: SKOS.broader.getURI(),
                    // broaderProps: [],
                    // narrowerProps: [],
                    // includeSubProps: true,
                    // syncInverse: true,
                    visualization: ConceptTreeVisualizationMode.hierarchyBased
                }
                // let conceptTreeBaseBroaderPropPref: string = prefs[Properties.pref_concept_tree_base_broader_prop];
                // if (conceptTreeBaseBroaderPropPref != null) {
                //     this.conceptTreePreferences.baseBroaderUri = conceptTreeBaseBroaderPropPref;
                // }
                // let conceptTreeBroaderPropsPref: string = prefs[Properties.pref_concept_tree_broader_props];
                // if (conceptTreeBroaderPropsPref != null) {
                //     this.conceptTreePreferences.broaderProps = conceptTreeBroaderPropsPref.split(",");
                // }
                // let conceptTreeNarrowerPropsPref: string = prefs[Properties.pref_concept_tree_narrower_props];
                // if (conceptTreeNarrowerPropsPref != null) {
                //     this.conceptTreePreferences.narrowerProps = conceptTreeNarrowerPropsPref.split(",");
                // }
                let conceptTreeVisualizationPref: string = prefs[Properties.pref_concept_tree_visualization];
                if (conceptTreeVisualizationPref != null && conceptTreeVisualizationPref == ConceptTreeVisualizationMode.searchBased) {
                    this.conceptTreePreferences.visualization = conceptTreeVisualizationPref;
                }
                // this.conceptTreePreferences.includeSubProps = prefs[Properties.pref_concept_tree_include_subprops] != "false";
                // this.conceptTreePreferences.syncInverse = prefs[Properties.pref_concept_tree_sync_inverse] != "false";

                //lexical entry list preferences
                this.lexEntryListPreferences = {
                    visualization: LexEntryVisualizationMode.indexBased,
                    indexLength: 1
                }
                let lexEntryListVisualizationPref: string = prefs[Properties.pref_lex_entry_list_visualization];
                if (lexEntryListVisualizationPref != null && lexEntryListVisualizationPref == LexEntryVisualizationMode.searchBased) {
                    this.lexEntryListPreferences.visualization = lexEntryListVisualizationPref;
                }
                let lexEntryListIndexLenghtPref: string = prefs[Properties.pref_lex_entry_list_index_lenght];
                if (lexEntryListIndexLenghtPref == "2") {
                    this.lexEntryListPreferences.indexLength = 2;
                }
            })
        );
    }

    initProjectSettings(): Observable<void> {
        var properties: string[] = [Properties.setting_languages];
        return this.prefService.getProjectSettings(properties).pipe(
            map(settings => {
                var langsValue: string = settings[Properties.setting_languages];
                try {
                    this.projectLanguagesSetting = <Language[]>JSON.parse(langsValue);
                    Languages.sortLanguages(this.projectLanguagesSetting);
                } catch (err) {
                    this.basicModals.alert("Error", "Project setting initialization has encountered a problem during parsing " +
                        "languages settings. Default languages will be set for this project.", ModalType.error);
                    this.projectLanguagesSetting = [
                        { name: "German", tag: "de" }, { name: "English", tag: "en" }, { name: "Spanish", tag: "es" },
                        { name: "French", tag: "fr" }, { name: "Italian", tag: "it" }
                    ];
                }
            })
        );
    }

    getActiveSchemes(): IRI[] {
        return this.activeSchemes;
    }
    setActiveSchemes(schemes: IRI[]) {
        if (schemes == null) {
            this.activeSchemes = [];
        } else {
            this.activeSchemes = schemes;
        }
        this.prefService.setActiveSchemes(this.activeSchemes).subscribe(
            stResp => {
                this.eventHandler.schemeChangedEvent.emit(this.activeSchemes);
            }
        );
    }
    isActiveScheme(scheme: IRI): boolean {
        return this.activeSchemes.some(s => s.equals(scheme));
    }

    getActiveLexicon(): IRI {
        return this.activeLexicon;
    }
    setActiveLexicon(lexicon: IRI) {
        this.activeLexicon = lexicon;
        this.prefService.setPUSetting(Properties.pref_active_lexicon, this.activeLexicon.getIRI()).subscribe(
            stResp => {
                this.eventHandler.lexiconChangedEvent.emit(this.activeLexicon);
            }
        );
    }
    isActiveLexicon(lexicon: IRI): boolean {
        return this.activeLexicon != null && this.activeLexicon.equals(lexicon);
    }

    getShowFlags(): boolean {
        return this.showFlags;
    }
    setShowFlags(show: boolean) {
        this.showFlags = show;
        this.prefService.setShowFlags(show).subscribe();
    }

    getValueFilterLanguages(): ValueFilterLanguages {
        return this.filterValueLang;
    }
    setValueFilterLanguages(filter: ValueFilterLanguages) {
        this.prefService.setPUSetting(Properties.pref_filter_value_languages, JSON.stringify(filter)).subscribe();
        this.filterValueLang = filter;
    }

    //concept tree settings
    getConceptTreePreferences(): ConceptTreePreference {
        return this.conceptTreePreferences;
    }
    // setConceptTreeBaseBroaderProp(propUri: string) {
    //     this.prefService.setPUSetting(Properties.pref_concept_tree_base_broader_prop, propUri).subscribe();
    //     this.conceptTreePreferences.baseBroaderUri = propUri;
    // }
    // setConceptTreeBroaderProps(props: string[]) {
    //     let prefValue: string;
    //     if (props.length > 0) {
    //         prefValue = props.join(",")
    //     }
    //     this.prefService.setPUSetting(Properties.pref_concept_tree_broader_props, prefValue).subscribe();
    //     this.conceptTreePreferences.broaderProps = props;
    // }
    // setConceptTreeNarrowerProps(props: string[]) {
    //     let prefValue: string;
    //     if (props.length > 0) {
    //         prefValue = props.join(",")
    //     }
    //     this.prefService.setPUSetting(Properties.pref_concept_tree_narrower_props, prefValue).subscribe();
    //     this.conceptTreePreferences.narrowerProps = props;
    // }
    // setConceptTreeIncludeSubProps(include: boolean) {
    //     this.prefService.setPUSetting(Properties.pref_concept_tree_include_subprops, include+"").subscribe();
    //     this.conceptTreePreferences.includeSubProps = include;
    // }
    // setConceptTreeSyncInverse(sync: boolean) {
    //     this.prefService.setPUSetting(Properties.pref_concept_tree_sync_inverse, sync+"").subscribe();
    //     this.conceptTreePreferences.syncInverse = sync;
    // }
    setConceptTreeVisualization(mode: ConceptTreeVisualizationMode) {
        this.prefService.setPUSetting(Properties.pref_concept_tree_visualization, mode).subscribe();
        this.conceptTreePreferences.visualization = mode;
    }

    //lex entry list settings
    getLexicalEntryListPreferences(): LexicalEntryListPreference {
        return this.lexEntryListPreferences;
    }
    setLexicalEntryListVisualization(mode: LexEntryVisualizationMode) {
        this.prefService.setPUSetting(Properties.pref_lex_entry_list_visualization, mode).subscribe();
        this.lexEntryListPreferences.visualization = mode;
    }
    setLexicalEntryListIndexLenght(lenght: number) {
        this.prefService.setPUSetting(Properties.pref_lex_entry_list_index_lenght, lenght + "").subscribe();
        this.lexEntryListPreferences.indexLength = lenght;
    }

    //Graph settings
    getResourceViewPartitionsFilter(): ResViewPartitionFilterPreference {
        return this.resViewPartitionFilter;
    }
    setResourceViewPartitionFilter(pref: ResViewPartitionFilterPreference) {
        this.prefService.setPUSetting(Properties.pref_res_view_partition_filter, JSON.stringify(pref)).subscribe();
        this.resViewPartitionFilter = pref;
    }

    getHideLiteralGraphNodes(): boolean {
        return this.hideLiteralGraphNodes;
    }
    setHideLiteralGraphNodes(show: boolean) {
        this.hideLiteralGraphNodes = show;
        this.prefService.setPUSetting(Properties.pref_hide_literal_graph_nodes, show + "").subscribe();
    }

    /**
     * Returns the language available in the project
     */
    getProjectLanguages(): Language[] {
        return this.projectLanguagesSetting;
    }
    setProjectLanguages(languages: Language[]) {
        this.projectLanguagesSetting = languages;
    }


    /* =============================
    ==== PREFERENCES IN COOKIES ====
    ============================= */

    /**
     * Sets the preference to show or hide the inferred information in resource view
     */
    setInferenceInResourceView(showInferred: boolean) {
        Cookie.setCookie(Cookie.RES_VIEW_INCLUDE_INFERENCE, showInferred + "", 365 * 10);
    }
    /**
     * Gets the preference to show or hide the inferred information in resource view
     */
    getInferenceInResourceView(): boolean {
        return Cookie.getCookie(Cookie.RES_VIEW_INCLUDE_INFERENCE) == "true";
    }

    /**
     * Sets the preference to show the URI or the rendering of resources in resource view
     */
    setRenderingInResourceView(rendering: boolean) {
        Cookie.setCookie(Cookie.RES_VIEW_RENDERING, rendering + "", 365 * 10);
    }
    /**
     * Gets the preference to show the URI or the rendering of resources in resource view
     */
    getRenderingInResourceView(): boolean {
        let cookieValue: string = Cookie.getCookie(Cookie.RES_VIEW_RENDERING);
        return (cookieValue == null || cookieValue == "true"); //default true, so true if cookie is not defined
    }

    /**
     * Sets the preference to show the deprecated resources in the trees/lists
     * @param showDeprecated 
     */
    setShowDeprecated(showDeprecated: boolean) {
        Cookie.setCookie(Cookie.SHOW_DEPRECATED, showDeprecated + "", 365 * 10);
    }
    /**
     * Gets the preference to show the deprecated resources in the trees/lists
     */
    getShowDeprecated(): boolean {
        let cookieValue: string = Cookie.getCookie(Cookie.SHOW_DEPRECATED);
        return cookieValue != "false"; //default true
    }


    initSearchSettingsCookie() {
        let searchModeCookie: string = Cookie.getCookie(Cookie.SEARCH_STRING_MATCH_MODE);
        if (searchModeCookie != null) {
            this.searchSettings.stringMatchMode = <SearchMode>searchModeCookie;
        }
        let useUriCookie: string = Cookie.getCookie(Cookie.SEARCH_USE_URI);
        if (useUriCookie != null) {
            this.searchSettings.useURI = useUriCookie == "true";
        }
        let useLocalNameCookie: string = Cookie.getCookie(Cookie.SEARCH_USE_LOCAL_NAME);
        if (useLocalNameCookie != null) {
            this.searchSettings.useLocalName = useLocalNameCookie == "true";
        }
        let useNotesCookie: string = Cookie.getCookie(Cookie.SEARCH_USE_NOTES);
        if (useNotesCookie != null) {
            this.searchSettings.useNotes = useNotesCookie == "true";
        }
        let restrictSchemesCookie: string = Cookie.getCookie(Cookie.SEARCH_CONCEPT_SCHEME_RESTRICTION);
        if (restrictSchemesCookie != null) {
            this.searchSettings.restrictActiveScheme = restrictSchemesCookie == "true";
        }
    }
    getSearchSettings(): SearchSettings {
        return this.searchSettings;
    }
    setSearchSettings(settings: SearchSettings) {
        Cookie.setCookie(Cookie.SEARCH_STRING_MATCH_MODE, settings.stringMatchMode, 365 * 10);
        Cookie.setCookie(Cookie.SEARCH_USE_URI, settings.useURI + "", 365 * 10);
        Cookie.setCookie(Cookie.SEARCH_USE_LOCAL_NAME, settings.useLocalName + "", 365 * 10);
        Cookie.setCookie(Cookie.SEARCH_USE_NOTES, settings.useNotes + "", 365 * 10);
        Cookie.setCookie(Cookie.SEARCH_CONCEPT_SCHEME_RESTRICTION, settings.restrictActiveScheme + "", 365 * 10);
        if (this.searchSettings.languages != settings.languages) {
            this.prefService.setPUSetting(Properties.pref_search_languages, JSON.stringify(settings.languages)).subscribe();
        }
        if (this.searchSettings.restrictLang != settings.restrictLang) {
            this.prefService.setPUSetting(Properties.pref_search_restrict_lang, settings.restrictLang + "").subscribe();
        }
        if (this.searchSettings.includeLocales != settings.includeLocales) {
            this.prefService.setPUSetting(Properties.pref_search_include_locales, settings.includeLocales + "").subscribe();
        }
        if (this.searchSettings.useAutocompletion != settings.useAutocompletion) {
            this.prefService.setPUSetting(Properties.pref_search_use_autocomplete, settings.useAutocompletion + "").subscribe();
        }
        this.searchSettings = settings;
        this.eventHandler.searchPrefsUpdatedEvent.emit();
    }

}