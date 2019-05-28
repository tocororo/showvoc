import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { Language, Languages } from '../models/LanguagesCountries';
import { ConceptTreePreference, ConceptTreeVisualizationMode, LexEntryVisualizationMode, LexicalEntryListPreference, Properties, ResViewPartitionFilterPreference, SearchMode, SearchSettings, ValueFilterLanguages, ProjectPreferences, ProjectSettings } from '../models/Properties';
import { IRI, RDFResourceRolesEnum } from '../models/Resources';
import { ResViewPartition } from '../models/ResourceView';
import { PreferencesSettingsServices } from '../services/preferences-settings.service';
import { Cookie } from './Cookie';
import { PMKIEventHandler } from './PMKIEventHandler';
import { PMKIContext } from './PMKIContext';

@Injectable()
export class PMKIProperties {

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
                let projectPreferences: ProjectPreferences = PMKIContext.getProjectCtx().getProjectPreferences();

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

                projectPreferences.showFlags = prefs[Properties.pref_show_flags] == "true";

                let filterValueLangPref = prefs[Properties.pref_filter_value_languages];
                if (filterValueLangPref == null) {
                    projectPreferences.filterValueLang = { languages: [], enabled: false }; //default
                } else {
                    projectPreferences.filterValueLang = JSON.parse(filterValueLangPref);
                }

                //graph preferences
                let rvPartitionFilterPref = prefs[Properties.pref_res_view_partition_filter];
                if (rvPartitionFilterPref != null) {
                    projectPreferences.resViewPartitionFilter = JSON.parse(rvPartitionFilterPref);
                } else {
                    projectPreferences.resViewPartitionFilter = {};
                    for (let role in RDFResourceRolesEnum) {
                        projectPreferences.resViewPartitionFilter[role] = [ResViewPartition.lexicalizations];
                    }
                }

                projectPreferences.hideLiteralGraphNodes = prefs[Properties.pref_hide_literal_graph_nodes] != "false";

                //concept tree preferences
                let conceptTreePref: ConceptTreePreference = new ConceptTreePreference();
                let conceptTreeVisualizationPref: string = prefs[Properties.pref_concept_tree_visualization];
                if (conceptTreeVisualizationPref != null && conceptTreeVisualizationPref == ConceptTreeVisualizationMode.searchBased) {
                    conceptTreePref.visualization = conceptTreeVisualizationPref;
                }
                projectPreferences.conceptTreePreferences = conceptTreePref

                //lexical entry list preferences
                let lexEntryListPref = new LexicalEntryListPreference();
                let lexEntryListVisualizationPref: string = prefs[Properties.pref_lex_entry_list_visualization];
                if (lexEntryListVisualizationPref != null && lexEntryListVisualizationPref == LexEntryVisualizationMode.searchBased) {
                    lexEntryListPref.visualization = lexEntryListVisualizationPref;
                }
                let lexEntryListIndexLenghtPref: string = prefs[Properties.pref_lex_entry_list_index_lenght];
                if (lexEntryListIndexLenghtPref == "2") {
                    lexEntryListPref.indexLength = 2;
                }
                projectPreferences.lexEntryListPreferences = lexEntryListPref;


                //search settings
                let searchSettings: SearchSettings = new SearchSettings();
                // let searchLangsPref = prefs[Properties.pref_search_languages];
                // if (searchLangsPref == null) {
                //     searchSettings.languages = [];
                // } else {
                //     searchSettings.languages = JSON.parse(searchLangsPref);
                // }
                // searchSettings.restrictLang = prefs[Properties.pref_search_restrict_lang] == "true";
                // searchSettings.includeLocales = prefs[Properties.pref_search_include_locales] == "true";
                // searchSettings.useAutocompletion = prefs[Properties.pref_search_use_autocomplete] == "true";
                projectPreferences.searchSettings = searchSettings;

                this.initSearchSettingsCookie();
            })
        );
    }

    initProjectSettings(): Observable<void> {
        var properties: string[] = [Properties.setting_languages];
        return this.prefService.getProjectSettings(properties).pipe(
            map(settings => {
                let projectSettings: ProjectSettings = PMKIContext.getProjectCtx().getProjectSettings();
                
                var langsValue: string = settings[Properties.setting_languages];
                try {
                    projectSettings.projectLanguagesSetting = <Language[]>JSON.parse(langsValue);
                    Languages.sortLanguages(projectSettings.projectLanguagesSetting);
                } catch (err) {
                    this.basicModals.alert("Error", "Project setting initialization has encountered a problem during parsing " +
                        "languages settings. Default languages will be set for this project.", ModalType.error);
                    projectSettings.projectLanguagesSetting = [
                        { name: "German", tag: "de" }, { name: "English", tag: "en" }, { name: "Spanish", tag: "es" },
                        { name: "French", tag: "fr" }, { name: "Italian", tag: "it" }
                    ];
                }
            })
        );
    }

    setActiveSchemes(schemes: IRI[]) {
        let projPref: ProjectPreferences = PMKIContext.getProjectCtx().getProjectPreferences();
        if (schemes == null) {
            projPref.activeSchemes = [];
        } else {
            projPref.activeSchemes = schemes;
        }
        this.prefService.setActiveSchemes(projPref.activeSchemes).subscribe(
            stResp => {
                this.eventHandler.schemeChangedEvent.emit(projPref.activeSchemes);
            }
        );
    }

    setActiveLexicon(lexicon: IRI) {
        let projPref: ProjectPreferences = PMKIContext.getProjectCtx().getProjectPreferences();
        projPref.activeLexicon = lexicon;
        this.prefService.setPUSetting(Properties.pref_active_lexicon, projPref.activeLexicon.getIRI()).subscribe(
            stResp => {
                this.eventHandler.lexiconChangedEvent.emit(projPref.activeLexicon);
            }
        );
    }

    getShowFlags(): boolean {
        if (PMKIContext.getProjectCtx() != null) {
            return PMKIContext.getProjectCtx().getProjectPreferences().showFlags;
        } else {
            return PMKIContext.getSystemSettings().showFlags;
        }
    }
    setShowFlags(show: boolean) {
        PMKIContext.getProjectCtx().getProjectPreferences().showFlags = show;
        this.eventHandler.showFlagChangedEvent.emit(show);
        this.prefService.setShowFlags(show).subscribe();
    }

    setValueFilterLanguages(filter: ValueFilterLanguages) {
        this.prefService.setPUSetting(Properties.pref_filter_value_languages, JSON.stringify(filter)).subscribe();
        PMKIContext.getProjectCtx().getProjectPreferences().filterValueLang = filter;
    }

    //concept tree settings
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
        PMKIContext.getProjectCtx().getProjectPreferences().conceptTreePreferences.visualization = mode;
    }

    //lex entry list settings
    setLexicalEntryListVisualization(mode: LexEntryVisualizationMode) {
        this.prefService.setPUSetting(Properties.pref_lex_entry_list_visualization, mode).subscribe();
        PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences.visualization = mode;
    }
    setLexicalEntryListIndexLenght(lenght: number) {
        this.prefService.setPUSetting(Properties.pref_lex_entry_list_index_lenght, lenght + "").subscribe();
        PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences.indexLength = lenght;
    }

    //Graph settings
    setResourceViewPartitionFilter(pref: ResViewPartitionFilterPreference) {
        this.prefService.setPUSetting(Properties.pref_res_view_partition_filter, JSON.stringify(pref)).subscribe();
        PMKIContext.getProjectCtx().getProjectPreferences().resViewPartitionFilter = pref;
    }

    setHideLiteralGraphNodes(show: boolean) {
        PMKIContext.getProjectCtx().getProjectPreferences().hideLiteralGraphNodes = show;
        this.prefService.setPUSetting(Properties.pref_hide_literal_graph_nodes, show + "").subscribe();
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
        let projectSettings: ProjectPreferences = PMKIContext.getProjectCtx().getProjectPreferences();
        let searchModeCookie: string = Cookie.getCookie(Cookie.SEARCH_STRING_MATCH_MODE);
        if (searchModeCookie != null) {
            projectSettings.searchSettings.stringMatchMode = <SearchMode>searchModeCookie;
        }
        let useUriCookie: string = Cookie.getCookie(Cookie.SEARCH_USE_URI);
        if (useUriCookie != null) {
            projectSettings.searchSettings.useURI = useUriCookie == "true";
        }
        let useLocalNameCookie: string = Cookie.getCookie(Cookie.SEARCH_USE_LOCAL_NAME);
        if (useLocalNameCookie != null) {
            projectSettings.searchSettings.useLocalName = useLocalNameCookie == "true";
        }
        let useNotesCookie: string = Cookie.getCookie(Cookie.SEARCH_USE_NOTES);
        if (useNotesCookie != null) {
            projectSettings.searchSettings.useNotes = useNotesCookie == "true";
        }
        let restrictSchemesCookie: string = Cookie.getCookie(Cookie.SEARCH_CONCEPT_SCHEME_RESTRICTION);
        if (restrictSchemesCookie != null) {
            projectSettings.searchSettings.restrictActiveScheme = restrictSchemesCookie == "true";
        }
    }
    setSearchSettings(settings: SearchSettings) {
        let projectSettings: ProjectPreferences = PMKIContext.getProjectCtx().getProjectPreferences();

        Cookie.setCookie(Cookie.SEARCH_STRING_MATCH_MODE, settings.stringMatchMode, 365 * 10);
        Cookie.setCookie(Cookie.SEARCH_USE_URI, settings.useURI + "", 365 * 10);
        Cookie.setCookie(Cookie.SEARCH_USE_LOCAL_NAME, settings.useLocalName + "", 365 * 10);
        Cookie.setCookie(Cookie.SEARCH_USE_NOTES, settings.useNotes + "", 365 * 10);
        Cookie.setCookie(Cookie.SEARCH_CONCEPT_SCHEME_RESTRICTION, settings.restrictActiveScheme + "", 365 * 10);
        if (projectSettings.searchSettings.languages != settings.languages) {
            this.prefService.setPUSetting(Properties.pref_search_languages, JSON.stringify(settings.languages)).subscribe();
        }
        if (projectSettings.searchSettings.restrictLang != settings.restrictLang) {
            this.prefService.setPUSetting(Properties.pref_search_restrict_lang, settings.restrictLang + "").subscribe();
        }
        if (projectSettings.searchSettings.includeLocales != settings.includeLocales) {
            this.prefService.setPUSetting(Properties.pref_search_include_locales, settings.includeLocales + "").subscribe();
        }
        if (projectSettings.searchSettings.useAutocompletion != settings.useAutocompletion) {
            this.prefService.setPUSetting(Properties.pref_search_use_autocomplete, settings.useAutocompletion + "").subscribe();
        }
        projectSettings.searchSettings = settings;
        this.eventHandler.searchPrefsUpdatedEvent.emit();
    }

}