import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { Language, Languages } from '../models/LanguagesCountries';
import { ExtensionPointID } from '../models/Plugins';
import { Project } from '../models/Project';
import { ClassIndividualPanelSearchMode, ClassTreeFilter, ClassTreePreference, ConceptTreePreference, ConceptTreeVisualizationMode, LexEntryVisualizationMode, LexicalEntryListPreference, ProjectPreferences, ProjectSettings, Properties, ResViewPartitionFilterPreference, SearchMode, SearchSettings, ValueFilterLanguages } from '../models/Properties';
import { IRI, RDFResourceRolesEnum, Value } from '../models/Resources';
import { ResViewPartition } from '../models/ResourceView';
import { OWL, RDFS } from '../models/Vocabulary';
import { PreferencesSettingsServices } from '../services/preferences-settings.service';
import { Cookie } from './Cookie';
import { PMKIContext, ProjectContext } from './PMKIContext';
import { PMKIEventHandler } from './PMKIEventHandler';
import { ResourceUtils } from './ResourceUtils';

@Injectable()
export class PMKIProperties {

    constructor(private prefService: PreferencesSettingsServices, private basicModals: BasicModalsServices, private eventHandler: PMKIEventHandler) {
    }

    /* =============================
    ========= PREFERENCES ==========
    ============================= */

    /**
     * To call each time the user change project
     * 
     * Note: since the default user is the same for every visitor, the user-project preferences are stored as cookie
     * (and not on ST as in VocBench). In this way we prevent that a visitor changes the preferences for all the other visitors.
     * The only preference stored server-side is the rendering languages since this is used even server-side by the rendering engine.
     */
    initUserProjectPreferences(projectCtx: ProjectContext): Observable<any> {
        PMKIContext.setTempProject(projectCtx.getProject());
        return this.prefService.getPUSettings([Properties.pref_languages], null, ExtensionPointID.RENDERING_ENGINE_ID).pipe(
            map(prefs => {
                PMKIContext.removeTempProject();
                projectCtx.getProjectPreferences().projectLanguagesPreference = prefs[Properties.pref_languages].split(",");
                //init also cookie-stored preferences
                this.initPreferencesCookie(projectCtx);
            })
        );

    }

    initProjectSettings(projectCtx: ProjectContext): Observable<void> {
        var properties: string[] = [Properties.setting_languages];
        return this.prefService.getProjectSettings(properties, projectCtx.getProject()).pipe(
            map(settings => {
                let projectSettings: ProjectSettings = projectCtx.getProjectSettings();
                
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

    setActiveSchemes(projectCtx: ProjectContext, schemes: IRI[]) {
        let projPref: ProjectPreferences = projectCtx.getProjectPreferences();
        if (schemes == null) {
            projPref.activeSchemes = [];
        } else {
            projPref.activeSchemes = schemes;
        }
        this.eventHandler.schemeChangedEvent.emit(projPref.activeSchemes);
        this.setUserProjectCookiePref(Properties.pref_active_schemes, projectCtx.getProject(), projPref.activeSchemes);
    }

    setActiveLexicon(projectCtx: ProjectContext, lexicon: IRI) {
        let projPref: ProjectPreferences = projectCtx.getProjectPreferences();
        projPref.activeLexicon = lexicon;
        this.eventHandler.lexiconChangedEvent.emit(projPref.activeLexicon);
        this.setUserProjectCookiePref(Properties.pref_active_lexicon, projectCtx.getProject(), projPref.activeLexicon);
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
        this.setUserProjectCookiePref(Properties.pref_show_flags, PMKIContext.getProjectCtx().getProject(), show);
    }

    setValueFilterLanguages(filter: ValueFilterLanguages) {
        this.setUserProjectCookiePref(Properties.pref_filter_value_languages, PMKIContext.getProjectCtx().getProject(), JSON.stringify(filter));
        PMKIContext.getProjectCtx().getProjectPreferences().filterValueLang = filter;
    }

    //class tree settings
    setClassTreeFilter(filter: ClassTreeFilter) {
        this.setUserProjectCookiePref(Properties.pref_class_tree_filter, PMKIContext.getProjectCtx().getProject(), JSON.stringify(filter));
        PMKIContext.getProjectCtx().getProjectPreferences().classTreePreferences.filter = filter;
        this.eventHandler.classFilterChangedEvent.emit();
    }
    setClassTreeRoot(rootUri: string) {
        this.setUserProjectCookiePref(Properties.pref_class_tree_root, PMKIContext.getProjectCtx().getProject(), rootUri);
        PMKIContext.getProjectCtx().getProjectPreferences().classTreePreferences.rootClassUri = rootUri;
    }
    setClassTreeShowInstances(show: boolean) {
        this.setUserProjectCookiePref(Properties.pref_class_tree_show_instances, PMKIContext.getProjectCtx().getProject(), show);
        PMKIContext.getProjectCtx().getProjectPreferences().classTreePreferences.showInstancesNumber = show;
    }

    //concept tree settings
    setConceptTreeVisualization(mode: ConceptTreeVisualizationMode) {
        this.setUserProjectCookiePref(Properties.pref_concept_tree_visualization, PMKIContext.getProjectCtx().getProject(), mode);
        PMKIContext.getProjectCtx().getProjectPreferences().conceptTreePreferences.visualization = mode;
    }

    //lex entry list settings
    setLexicalEntryListVisualization(mode: LexEntryVisualizationMode) {
        this.setUserProjectCookiePref(Properties.pref_lex_entry_list_visualization, PMKIContext.getProjectCtx().getProject(), mode);
        PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences.visualization = mode;
    }
    setLexicalEntryListIndexLenght(lenght: number) {
        this.setUserProjectCookiePref(Properties.pref_lex_entry_list_index_lenght, PMKIContext.getProjectCtx().getProject(), lenght);
        PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences.indexLength = lenght;
    }

    //Graph settings
    setResourceViewPartitionFilter(pref: ResViewPartitionFilterPreference) {
        this.setUserProjectCookiePref(Properties.pref_res_view_partition_filter, PMKIContext.getProjectCtx().getProject(), JSON.stringify(pref));
        PMKIContext.getProjectCtx().getProjectPreferences().resViewPartitionFilter = pref;
    }

    setHideLiteralGraphNodes(show: boolean) {
        PMKIContext.getProjectCtx().getProjectPreferences().hideLiteralGraphNodes = show;
        this.setUserProjectCookiePref(Properties.pref_filter_value_languages, PMKIContext.getProjectCtx().getProject(), show);
    }


    /* =============================
    ==== PREFERENCES IN COOKIES ====
    ============================= */

    private initPreferencesCookie(projectCtx: ProjectContext) {
        let projectPreferences: ProjectPreferences = projectCtx.getProjectPreferences();
            let project: Project = projectCtx.getProject();

            //active scheme
            let activeSchemes = [];
            let activeSchemesPref: string = this.getUserProjectCookiePref(Properties.pref_active_schemes, project);
            if (activeSchemesPref != null) {
                let skSplitted: string[] = activeSchemesPref.split(",");
                for (var i = 0; i < skSplitted.length; i++) {
                    activeSchemes.push(ResourceUtils.parseIRI(skSplitted[i]));
                }
            }
            this.setActiveSchemes(projectCtx, activeSchemes);

            //active lexicon
            let activeLexicon = null;
            let activeLexiconPref: string = this.getUserProjectCookiePref(Properties.pref_active_lexicon, project);
            if (activeLexiconPref != null) {
                activeLexicon = ResourceUtils.parseIRI(activeLexiconPref);
                this.setActiveLexicon(projectCtx, activeLexicon);
            }

            //show flag
            projectPreferences.showFlags = this.getUserProjectCookiePref(Properties.pref_show_flags, project) != "false";
            
            //graph & resView pref: filter value lang
            let filterValueLangPref = this.getUserProjectCookiePref(Properties.pref_filter_value_languages, project);
            if (filterValueLangPref == null) {
                projectPreferences.filterValueLang = { languages: [], enabled: false }; //default
            } else {
                projectPreferences.filterValueLang = JSON.parse(filterValueLangPref);
            }

            //graph preferences
            let rvPartitionFilterPref = this.getUserProjectCookiePref(Properties.pref_res_view_partition_filter, project);
            if (rvPartitionFilterPref != null) {
                projectPreferences.resViewPartitionFilter = JSON.parse(rvPartitionFilterPref);
            } else {
                let resViewPartitionFilter: ResViewPartitionFilterPreference = {};
                for (let role in RDFResourceRolesEnum) {
                    resViewPartitionFilter[role] = [ResViewPartition.lexicalizations];
                }
                projectPreferences.resViewPartitionFilter = resViewPartitionFilter;
            }
            projectPreferences.hideLiteralGraphNodes = this.getUserProjectCookiePref(Properties.pref_hide_literal_graph_nodes, project) != "false";

            //cls tree preferences
            let classTreePreferences: ClassTreePreference = { 
                showInstancesNumber: this.getUserProjectCookiePref(Properties.pref_class_tree_show_instances, project) == "true",
                rootClassUri: (projectCtx.getProject().getModelType() == RDFS.uri) ? RDFS.resource.getIRI() : OWL.thing.getIRI(),
                filter: new ClassTreeFilter()
            };
            let classTreeFilterPref: string = this.getUserProjectCookiePref(Properties.pref_class_tree_filter, project);
            if (classTreeFilterPref != null) {
                classTreePreferences.filter = JSON.parse(classTreeFilterPref);
            }
            let classTreeRootPref: string = this.getUserProjectCookiePref(Properties.pref_class_tree_root, project);
            if (classTreeRootPref != null) {
                classTreePreferences.rootClassUri = classTreeRootPref;
            }
            projectPreferences.classTreePreferences = classTreePreferences;

            //concept tree preferences
            let conceptTreePref: ConceptTreePreference = new ConceptTreePreference();
            let conceptTreeVisualizationPref: string = this.getUserProjectCookiePref(Properties.pref_concept_tree_visualization, project);
            if (conceptTreeVisualizationPref != null && conceptTreeVisualizationPref == ConceptTreeVisualizationMode.searchBased) {
                conceptTreePref.visualization = conceptTreeVisualizationPref;
            }
            projectPreferences.conceptTreePreferences = conceptTreePref

            //lexical entry list preferences
            let lexEntryListPref = new LexicalEntryListPreference();
            let lexEntryListVisualizationPref: string = this.getUserProjectCookiePref(Properties.pref_lex_entry_list_visualization, project);
            if (lexEntryListVisualizationPref != null && lexEntryListVisualizationPref == LexEntryVisualizationMode.searchBased) {
                lexEntryListPref.visualization = lexEntryListVisualizationPref;
            }
            let lexEntryListIndexLenghtPref: string = this.getUserProjectCookiePref(Properties.pref_lex_entry_list_index_lenght, project);
            if (lexEntryListIndexLenghtPref == "2") {
                lexEntryListPref.indexLength = 2;
            }
            projectPreferences.lexEntryListPreferences = lexEntryListPref;

            //search settings
            let searchSettings: SearchSettings = new SearchSettings();
            projectPreferences.searchSettings = searchSettings;

            let searchModeCookie: string = Cookie.getCookie(Cookie.SEARCH_STRING_MATCH_MODE);
            if (searchModeCookie != null) {
                searchSettings.stringMatchMode = <SearchMode>searchModeCookie;
            }
            searchSettings.useURI = Cookie.getCookie(Cookie.SEARCH_USE_URI) == "true";
            searchSettings.useLocalName = Cookie.getCookie(Cookie.SEARCH_USE_LOCAL_NAME) == "true";
            searchSettings.useNotes = Cookie.getCookie(Cookie.SEARCH_USE_NOTES) == "true";
            searchSettings.restrictActiveScheme = Cookie.getCookie(Cookie.SEARCH_CONCEPT_SCHEME_RESTRICTION) == "true";

            let clsIndPanelSearchModeCookie: string = Cookie.getCookie(Cookie.SEARCH_CLS_IND_PANEL);
            if (clsIndPanelSearchModeCookie != null) {
                searchSettings.classIndividualSearchMode = <ClassIndividualPanelSearchMode>clsIndPanelSearchModeCookie;
            }

            let searchLangsCookie: string = Cookie.getCookie(Cookie.SEARCH_LANGUAGES);
            searchSettings.languages = (searchLangsCookie == null) ? [] : JSON.parse(searchLangsCookie);
            searchSettings.restrictLang = Cookie.getCookie(Cookie.SEARCH_RESTRICT_LANG) == "true";
            searchSettings.includeLocales = Cookie.getCookie(Cookie.SEARCH_INCLUDE_LOCALES) == "true";
            searchSettings.useAutocompletion = Cookie.getCookie(Cookie.SEARCH_USE_AUTOMOMPLETION) == "true";
    }

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


    // initSearchSettingsCookie(preferences: ProjectPreferences) {
        
    // }
    setSearchSettings(projectCtx: ProjectContext, settings: SearchSettings) {
        let projectPreferences: ProjectPreferences = projectCtx.getProjectPreferences();
        Cookie.setCookie(Cookie.SEARCH_STRING_MATCH_MODE, settings.stringMatchMode, 365 * 10);
        Cookie.setCookie(Cookie.SEARCH_USE_URI, settings.useURI + "", 365 * 10);
        Cookie.setCookie(Cookie.SEARCH_USE_LOCAL_NAME, settings.useLocalName + "", 365 * 10);
        Cookie.setCookie(Cookie.SEARCH_USE_NOTES, settings.useNotes + "", 365 * 10);
        Cookie.setCookie(Cookie.SEARCH_CONCEPT_SCHEME_RESTRICTION, settings.restrictActiveScheme + "", 365 * 10);
        Cookie.setCookie(Cookie.SEARCH_LANGUAGES, JSON.stringify(settings.languages));
        Cookie.setCookie(Cookie.SEARCH_RESTRICT_LANG, settings.restrictLang+"");
        Cookie.setCookie(Cookie.SEARCH_INCLUDE_LOCALES, settings.includeLocales+"");
        Cookie.setCookie(Cookie.SEARCH_USE_AUTOMOMPLETION, settings.useAutocompletion + "");
        projectPreferences.searchSettings = settings;
        this.eventHandler.searchPrefsUpdatedEvent.emit();
    }


    getUserProjectCookiePref(pref: string, project: Project): string {
        let value = Cookie.getCookie(pref + "." + project.getName());
        if (value != null || value != "") {
            return value;
        }
        return null;
    }
    setUserProjectCookiePref(pref: string, project: Project, value: any) {
        let valueAsString: string;
        if (Array.isArray(value)) {
            if (value.length > 0) {
                let stringArray: string[] = [];
                value.forEach((v: any) => {
                    if (v instanceof Value) {
                        stringArray.push((<Value>v).toNT());
                    } else {
                        stringArray.push(v);
                    }
                })
                valueAsString = stringArray.join(",");
            }
        } else if (value instanceof Map) {
            if (value.size > 0) {
                let stringMap: { [key: string]: string } = {};
                value.forEach((v: any, key: string) => {
                    if (v instanceof Value) {
                        stringMap[key] = (<Value>v).toNT();
                    } else {
                        stringMap[key] = v;
                    }
                })
                valueAsString = JSON.stringify(stringMap);
            }
        } else if (value instanceof Value) {
            valueAsString = (<Value>value).toNT();
        } else if (value != null) {
            valueAsString = value;
        }
        Cookie.setCookie(pref + "." + project.getName(), valueAsString);
    }

}