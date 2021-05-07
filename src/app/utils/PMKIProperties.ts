import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { Language, Languages } from '../models/LanguagesCountries';
import { ExtensionPointID, Scope } from '../models/Plugins';
import { Project } from '../models/Project';
import { ClassIndividualPanelSearchMode, ClassTreeFilter, ClassTreePreference, ConceptTreePreference, ConceptTreeVisualizationMode, InstanceListPreference, InstanceListVisualizationMode, LexEntryVisualizationMode, LexicalEntryListPreference, PreferencesUtils, ProjectPreferences, ProjectSettings, Properties, ResViewPartitionFilterPreference, SearchMode, SearchSettings, SettingsEnum, SystemSettings, ValueFilterLanguages } from '../models/Properties';
import { IRI, RDFResourceRolesEnum } from '../models/Resources';
import { ResViewPartition } from '../models/ResourceView';
import { OWL, RDFS } from '../models/Vocabulary';
import { SettingsServices } from '../services/settings.service';
import { Cookie } from './Cookie';
import { PMKIContext, ProjectContext } from './PMKIContext';
import { PMKIEventHandler } from './PMKIEventHandler';
import { ResourceUtils } from './ResourceUtils';

@Injectable()
export class PMKIProperties {

    constructor(private settingsService: SettingsServices, private eventHandler: PMKIEventHandler) {
    }

    /* =============================
    ========= PREFERENCES ==========
    ============================= */

    /**
     * To call each time the user change project
     * 
     * Note: since the default user is the same for every visitor, the user-project preferences are stored as cookie
     * (and not on ST as in VocBench). In this way we prevent that a visitor changes the preferences for all the other visitors.
     * Some exceptions are made for
     * - the rendering languages
     * - the concept tree and lexical entry list visualization mode
     * that are stored also as settings. The settings provide the default and the user can override them with the cookies,
     * except for some scenarios where some settings abount concept tree and lex.entry list could block the overriding by the user
     * (see the related handling in initPreferencesCookie())
     */
    initUserProjectPreferences(projectCtx: ProjectContext): Observable<void> {
        PMKIContext.setTempProject(projectCtx.getProject());

        let projectPreferences = projectCtx.getProjectPreferences();

        let initRenderingPrefFn = this.settingsService.getSettings(ExtensionPointID.RENDERING_ENGINE_ID, Scope.PROJECT_USER).pipe(
            map(settings => {
                projectPreferences.renderingLanguagesPreference = settings.getPropertyValue(SettingsEnum.languages).split(",");
            })
        );
        
        let initStructuresPrefFn = this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER).pipe(
            map(settings => {
                //concept tree pref (initialized here, eventually overwritten later with cookie)
                projectPreferences.conceptTreePreferences = new ConceptTreePreference();
                let concTreeSetting: ConceptTreePreference = settings.getPropertyValue(SettingsEnum.conceptTree);
                if (concTreeSetting != null) {
                    PreferencesUtils.mergePreference(projectPreferences.conceptTreePreferences, concTreeSetting);
                }

                //instance list pref (initialized here, eventually overwritten later with cookie)
                projectPreferences.instanceListPreferences = new InstanceListPreference();
                let instListSetting: InstanceListPreference = settings.getPropertyValue(SettingsEnum.instanceList);
                if (instListSetting != null) {
                    PreferencesUtils.mergePreference(projectPreferences.instanceListPreferences, instListSetting);
                }
                
                //lex entry list pref (initialized here, eventually overwritten later with cookie)
                projectPreferences.lexEntryListPreferences = new LexicalEntryListPreference();
                let lexEntrySetting: LexicalEntryListPreference = settings.getPropertyValue(SettingsEnum.lexEntryList);
                if (lexEntrySetting != null) {
                    PreferencesUtils.mergePreference(projectPreferences.lexEntryListPreferences, lexEntrySetting);
                }
            })
        );

        return forkJoin([initRenderingPrefFn, initStructuresPrefFn]).pipe(
            finalize(() => {
                PMKIContext.removeTempProject()
            }),
            map(() => {
                //init also cookie-stored preferences
                this.initPreferencesCookie(projectCtx);
            })
        );
    }

    initProjectSettings(projectCtx: ProjectContext): Observable<void> {
        let projectSettings: ProjectSettings = projectCtx.getProjectSettings();
        return this.settingsService.getSettingsForProjectAdministration(ExtensionPointID.ST_CORE_ID, Scope.PROJECT, projectCtx.getProject()).pipe(
            map(settings => {
                let langsValue: Language[] = settings.getPropertyValue(SettingsEnum.languages);
                projectSettings.projectLanguagesSetting = langsValue;
                Languages.sortLanguages(projectSettings.projectLanguagesSetting);
            })
        )
    }

    setActiveSchemes(projectCtx: ProjectContext, schemes: IRI[]) {
        let projPref: ProjectPreferences = projectCtx.getProjectPreferences();
        if (schemes == null) {
            projPref.activeSchemes = [];
        } else {
            projPref.activeSchemes = schemes;
        }
        this.eventHandler.schemeChangedEvent.emit(projPref.activeSchemes);
        Cookie.setUserProjectCookiePref(Properties.pref_active_schemes, projectCtx.getProject(), projPref.activeSchemes);
    }

    setActiveLexicon(projectCtx: ProjectContext, lexicon: IRI) {
        let projPref: ProjectPreferences = projectCtx.getProjectPreferences();
        projPref.activeLexicon = lexicon;
        this.eventHandler.lexiconChangedEvent.emit(projPref.activeLexicon);
        Cookie.setUserProjectCookiePref(Properties.pref_active_lexicon, projectCtx.getProject(), projPref.activeLexicon);
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
        Cookie.setUserProjectCookiePref(Properties.pref_show_flags, PMKIContext.getProjectCtx().getProject(), show);
    }

    setValueFilterLanguages(filter: ValueFilterLanguages) {
        Cookie.setUserProjectCookiePref(Properties.pref_filter_value_languages, PMKIContext.getProjectCtx().getProject(), JSON.stringify(filter));
        PMKIContext.getProjectCtx().getProjectPreferences().filterValueLang = filter;
    }

    //class tree settings
    setClassTreeFilter(filter: ClassTreeFilter) {
        Cookie.setUserProjectCookiePref(Properties.pref_class_tree_filter, PMKIContext.getProjectCtx().getProject(), JSON.stringify(filter));
        PMKIContext.getProjectCtx().getProjectPreferences().classTreePreferences.filter = filter;
        this.eventHandler.classFilterChangedEvent.emit();
    }
    setClassTreeRoot(rootUri: string) {
        Cookie.setUserProjectCookiePref(Properties.pref_class_tree_root, PMKIContext.getProjectCtx().getProject(), rootUri);
        PMKIContext.getProjectCtx().getProjectPreferences().classTreePreferences.rootClassUri = rootUri;
    }
    setClassTreeShowInstances(show: boolean) {
        Cookie.setUserProjectCookiePref(Properties.pref_class_tree_show_instances, PMKIContext.getProjectCtx().getProject(), show);
        PMKIContext.getProjectCtx().getProjectPreferences().classTreePreferences.showInstancesNumber = show;
    }

    //instance list settings
    setInstanceListVisualization(mode: InstanceListVisualizationMode) {
        Cookie.setUserProjectCookiePref(Properties.pref_instance_list_visualization, PMKIContext.getProjectCtx().getProject(), mode);
        PMKIContext.getProjectCtx().getProjectPreferences().instanceListPreferences.visualization = mode;
    }
    setInstanceLisSafeToGoLimit(limit: number) {
        Cookie.setUserProjectCookiePref(Properties.pref_instance_list_safe_to_go_limit, PMKIContext.getProjectCtx().getProject(), limit+"");
        let instanceListPref = PMKIContext.getProjectCtx().getProjectPreferences().instanceListPreferences;
        instanceListPref.safeToGoLimit = limit;
        instanceListPref.safeToGoMap = {}; //changing the limit invalidated the safe => reset the map
    }

    //concept tree settings
    setConceptTreeVisualization(mode: ConceptTreeVisualizationMode) {
        Cookie.setUserProjectCookiePref(Properties.pref_concept_tree_visualization, PMKIContext.getProjectCtx().getProject(), mode);
        PMKIContext.getProjectCtx().getProjectPreferences().conceptTreePreferences.visualization = mode;
    }
    setConceptTreeSafeToGoLimit(limit: number) {
        Cookie.setUserProjectCookiePref(Properties.pref_concept_tree_safe_to_go_limit, PMKIContext.getProjectCtx().getProject(), limit);
        let conceptTreePref = PMKIContext.getProjectCtx().getProjectPreferences().conceptTreePreferences; 
        conceptTreePref.safeToGoLimit = limit;
        conceptTreePref.safeToGoMap = {}; //changing the limit invalidated the safe => reset the map
    }

    //lex entry list settings
    setLexicalEntryListVisualization(mode: LexEntryVisualizationMode) {
        Cookie.setUserProjectCookiePref(Properties.pref_lex_entry_list_visualization, PMKIContext.getProjectCtx().getProject(), mode);
        PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences.visualization = mode;
    }
    setLexicalEntryListIndexLenght(lenght: number) {
        Cookie.setUserProjectCookiePref(Properties.pref_lex_entry_list_index_length, PMKIContext.getProjectCtx().getProject(), lenght);
        PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences.indexLength = lenght;
    }
    setLexicalEntryListSafeToGoLimit(limit: number) {
        Cookie.setUserProjectCookiePref(Properties.pref_lex_entry_list_safe_to_go_limit, PMKIContext.getProjectCtx().getProject(), limit);
        let lexEntryListPref = PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences;
        lexEntryListPref.safeToGoLimit = limit;
        lexEntryListPref.safeToGoMap = {}; //changing the limit invalidated the safe => reset the map
    }

    //Graph settings
    setResourceViewPartitionFilter(pref: ResViewPartitionFilterPreference) {
        Cookie.setUserProjectCookiePref(Properties.pref_res_view_partition_filter, PMKIContext.getProjectCtx().getProject(), JSON.stringify(pref));
        PMKIContext.getProjectCtx().getProjectPreferences().resViewPartitionFilter = pref;
    }

    setHideLiteralGraphNodes(show: boolean) {
        PMKIContext.getProjectCtx().getProjectPreferences().hideLiteralGraphNodes = show;
        Cookie.setUserProjectCookiePref(Properties.pref_filter_value_languages, PMKIContext.getProjectCtx().getProject(), show);
    }


    /* =============================
    ==== PREFERENCES IN COOKIES ====
    ============================= */

    private initPreferencesCookie(projectCtx: ProjectContext) {
        let projectPreferences: ProjectPreferences = projectCtx.getProjectPreferences();
        let project: Project = projectCtx.getProject();

        //active scheme
        let activeSchemes = [];
        let activeSchemesPref: string = Cookie.getUserProjectCookiePref(Properties.pref_active_schemes, project);
        if (activeSchemesPref != null) {
            let skSplitted: string[] = activeSchemesPref.split(",");
            for (var i = 0; i < skSplitted.length; i++) {
                activeSchemes.push(ResourceUtils.parseIRI(skSplitted[i]));
            }
        }
        this.setActiveSchemes(projectCtx, activeSchemes);

        //active lexicon
        let activeLexicon = null;
        let activeLexiconPref: string = Cookie.getUserProjectCookiePref(Properties.pref_active_lexicon, project);
        if (activeLexiconPref != null) {
            activeLexicon = ResourceUtils.parseIRI(activeLexiconPref);
            this.setActiveLexicon(projectCtx, activeLexicon);
        }

        //show flag
        projectPreferences.showFlags = Cookie.getUserProjectCookiePref(Properties.pref_show_flags, project) != "false";
        
        //graph & resView pref: filter value lang
        let filterValueLangPref = Cookie.getUserProjectCookiePref(Properties.pref_filter_value_languages, project);
        if (filterValueLangPref == null) {
            projectPreferences.filterValueLang = { languages: [], enabled: false }; //default
        } else {
            projectPreferences.filterValueLang = JSON.parse(filterValueLangPref);
        }

        //graph preferences
        let rvPartitionFilterPref = Cookie.getUserProjectCookiePref(Properties.pref_res_view_partition_filter, project);
        if (rvPartitionFilterPref != null) {
            projectPreferences.resViewPartitionFilter = JSON.parse(rvPartitionFilterPref);
        } else {
            let resViewPartitionFilter: ResViewPartitionFilterPreference = {};
            for (let role in RDFResourceRolesEnum) {
                resViewPartitionFilter[role] = [ResViewPartition.lexicalizations];
            }
            projectPreferences.resViewPartitionFilter = resViewPartitionFilter;
        }
        projectPreferences.hideLiteralGraphNodes = Cookie.getUserProjectCookiePref(Properties.pref_hide_literal_graph_nodes, project) != "false";

        //cls tree preferences
        let classTreePreferences: ClassTreePreference = { 
            showInstancesNumber: Cookie.getUserProjectCookiePref(Properties.pref_class_tree_show_instances, project) == "true",
            rootClassUri: (projectCtx.getProject().getModelType() == RDFS.uri) ? RDFS.resource.getIRI() : OWL.thing.getIRI(),
            filter: new ClassTreeFilter()
        };
        let classTreeFilterPref: string = Cookie.getUserProjectCookiePref(Properties.pref_class_tree_filter, project);
        if (classTreeFilterPref != null) {
            classTreePreferences.filter = JSON.parse(classTreeFilterPref);
        }
        let classTreeRootPref: string = Cookie.getUserProjectCookiePref(Properties.pref_class_tree_root, project);
        if (classTreeRootPref != null) {
            classTreePreferences.rootClassUri = classTreeRootPref;
        }
        projectPreferences.classTreePreferences = classTreePreferences;

        //instance list preferences
        let instanceListPreferences: InstanceListPreference = projectPreferences.instanceListPreferences;
        //the visualization mode is taken from cookie only if there isn't any restriction on it or if the user is the admin
        if (PMKIContext.getLoggedUser().isAdmin() || instanceListPreferences.allowVisualizationChange) {
            let instanceListVisualizationPref: string = Cookie.getUserProjectCookiePref(Properties.pref_instance_list_visualization, project);
            if (instanceListVisualizationPref == InstanceListVisualizationMode.searchBased || instanceListVisualizationPref == InstanceListVisualizationMode.standard) {
                //overwrite only if the cookie value is an admitted value
                instanceListPreferences.visualization = instanceListVisualizationPref;
            }
        }
        let instanceListSafeToGoLimitPref: string = Cookie.getUserProjectCookiePref(Properties.pref_instance_list_safe_to_go_limit, project);
        if (instanceListSafeToGoLimitPref != null) {
            instanceListPreferences.safeToGoLimit = parseInt(instanceListSafeToGoLimitPref);
        }
        projectPreferences.instanceListPreferences = instanceListPreferences;

        //concept tree preferences
        let conceptTreePref: ConceptTreePreference = projectPreferences.conceptTreePreferences;
        //the visualization mode is taken from cookie only if there isn't any restriction on it or if the user is the admin
        if (PMKIContext.getLoggedUser().isAdmin() || conceptTreePref.allowVisualizationChange) {
            let conceptTreeVisualizationPref: string = Cookie.getUserProjectCookiePref(Properties.pref_concept_tree_visualization, project);
            if (conceptTreeVisualizationPref == ConceptTreeVisualizationMode.searchBased || conceptTreeVisualizationPref == ConceptTreeVisualizationMode.hierarchyBased) {
                //overwrite only if the cookie value is an admitted value
                conceptTreePref.visualization = conceptTreeVisualizationPref;
            }
        }
        let conceptTreeSafeToGoLimitPref: string = Cookie.getUserProjectCookiePref(Properties.pref_concept_tree_safe_to_go_limit, project);
        if (conceptTreeSafeToGoLimitPref != null) {
            conceptTreePref.safeToGoLimit = parseInt(conceptTreeSafeToGoLimitPref);
        }

        //lexical entry list preferences
        let lexEntryListPref: LexicalEntryListPreference = projectPreferences.lexEntryListPreferences;
        //the visualization mode is taken from cookie only if there isn't any restriction on it or if the user is the admin
        if (PMKIContext.getLoggedUser().isAdmin() || lexEntryListPref.allowVisualizationChange) {
            let lexEntryListVisualizationPref: string = Cookie.getUserProjectCookiePref(Properties.pref_lex_entry_list_visualization, project);
            if (lexEntryListVisualizationPref == LexEntryVisualizationMode.searchBased || lexEntryListVisualizationPref == LexEntryVisualizationMode.indexBased) {
                //overwrite only if the cookie value is an admitted value
                lexEntryListPref.visualization = lexEntryListVisualizationPref;
            }
        }
        //the index length is taken from cookie only if admin there isn't any restriction on it or if the user is the admin
        if (PMKIContext.getLoggedUser().isAdmin() || lexEntryListPref.allowIndexLengthChange) {
            let lexEntryListIndexLenghtPref: string = Cookie.getUserProjectCookiePref(Properties.pref_lex_entry_list_index_length, project);
            if (lexEntryListIndexLenghtPref == "1" || lexEntryListIndexLenghtPref == "2") {
                //overwrite only if the cookie value is an admitted value
                lexEntryListPref.indexLength = parseInt(lexEntryListIndexLenghtPref);
            }
        }
        let lexEntryListSafeToGoLimitPref: string = Cookie.getUserProjectCookiePref(Properties.pref_lex_entry_list_safe_to_go_limit, project);
        if (lexEntryListSafeToGoLimitPref != null) {
            lexEntryListPref.safeToGoLimit = parseInt(lexEntryListSafeToGoLimitPref);
        }

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


    initStartupSystemSettings() {
        this.settingsService.getStartupSettings().subscribe(
            settings => {
                let systemSettings: SystemSettings = PMKIContext.getSystemSettings();
                systemSettings.showFlags = settings.getPropertyValue(SettingsEnum.showFlags);
                let systemLanguages: Language[] = settings.getPropertyValue(SettingsEnum.languages);
                Languages.sortLanguages(systemLanguages);
                systemSettings.languages = systemLanguages;
            }
        )
    }

}