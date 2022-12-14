import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { Language, Languages } from '../models/LanguagesCountries';
import { ExtensionPointID, Scope } from '../models/Plugins';
import { Project } from '../models/Project';
import { AuthServiceMode, ClassIndividualPanelSearchMode, ClassTreeFilter, ClassTreePreference, ConceptTreePreference, ConceptTreeVisualizationMode, InstanceListPreference, InstanceListVisualizationMode, LexEntryVisualizationMode, LexicalEntryListPreference, PreferencesUtils, ProjectPreferences, ProjectSettings, Properties, ResViewPartitionFilterPreference, SearchMode, SearchSettings, SettingsEnum, SystemSettings, ValueFilterLanguages } from '../models/Properties';
import { IRI, RDFResourceRolesEnum } from '../models/Resources';
import { ResViewPartition } from '../models/ResourceView';
import { OWL, RDFS } from '../models/Vocabulary';
import { SettingsServices } from '../services/settings.service';
import { Cookie } from './Cookie';
import { NTriplesUtil } from './ResourceUtils';
import { ProjectContext, SVContext } from './SVContext';
import { SVEventHandler } from './SVEventHandler';

@Injectable()
export class SVProperties {

    constructor(private settingsService: SettingsServices, private eventHandler: SVEventHandler) {
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
        SVContext.setTempProject(projectCtx.getProject());

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
                SVContext.removeTempProject();
            }),
            map(() => {
                //init also cookie-stored preferences
                this.initPreferencesCookie(projectCtx);
            })
        );
    }

    initProjectSettings(projectCtx: ProjectContext): Observable<void> {
        let projectSettings: ProjectSettings = projectCtx.getProjectSettings();
        return this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.PROJECT).pipe(
            map(settings => {
                let langsValue: Language[] = settings.getPropertyValue(SettingsEnum.languages);
                projectSettings.projectLanguagesSetting = langsValue;
                Languages.sortLanguages(projectSettings.projectLanguagesSetting);
            })
        );
    }

    /**
     * This differs from the previous (initProjectSettings) for the service invokation used:
     * - The previous uses getSettings() which is useful for any user for initializing the project settings when accessing a project (so the project is set in the SVContext).
     * - The current one uses getSettingsForProjectAdministration which is used for initializing project settings when editing them from the administration dashboard. 
     *  Such service doesn't uses the project set in SVContext but explicitly specifies the project with a request parameter. 
     *  Moreover it requires administrator capabilities that the previous doesn't require
     * @param projectCtx 
     * @returns 
     */
    initProjectSettingsForAdministration(projectCtx: ProjectContext): Observable<void> {
        let projectSettings: ProjectSettings = projectCtx.getProjectSettings();
        return this.settingsService.getSettingsForProjectAdministration(ExtensionPointID.ST_CORE_ID, Scope.PROJECT, projectCtx.getProject()).pipe(
            map(settings => {
                let langsValue: Language[] = settings.getPropertyValue(SettingsEnum.languages);
                projectSettings.projectLanguagesSetting = langsValue;
                Languages.sortLanguages(projectSettings.projectLanguagesSetting);
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
        Cookie.setCookie(Properties.pref_active_schemes, projPref.activeSchemes, projectCtx.getProject());
    }

    setActiveLexicon(projectCtx: ProjectContext, lexicon: IRI) {
        let projPref: ProjectPreferences = projectCtx.getProjectPreferences();
        projPref.activeLexicon = lexicon;
        this.eventHandler.lexiconChangedEvent.emit(projPref.activeLexicon);
        Cookie.setCookie(Properties.pref_active_lexicon, projPref.activeLexicon, projectCtx.getProject());
    }

    getShowFlags(): boolean {
        if (SVContext.getProjectCtx() != null) {
            return SVContext.getProjectCtx().getProjectPreferences().showFlags;
        } else {
            return SVContext.getSystemSettings().showFlags;
        }
    }
    setShowFlags(show: boolean) {
        SVContext.getProjectCtx().getProjectPreferences().showFlags = show;
        this.eventHandler.showFlagChangedEvent.emit(show);
        Cookie.setCookie(Properties.pref_show_flags, show, SVContext.getProjectCtx().getProject());
    }

    setValueFilterLanguages(filter: ValueFilterLanguages) {
        Cookie.setCookie(Properties.pref_filter_value_languages, JSON.stringify(filter), SVContext.getProjectCtx().getProject());
        SVContext.getProjectCtx().getProjectPreferences().filterValueLang = filter;
    }

    //class tree settings
    setClassTreeFilter(filter: ClassTreeFilter) {
        Cookie.setCookie(Properties.pref_class_tree_filter, JSON.stringify(filter), SVContext.getProjectCtx().getProject());
        SVContext.getProjectCtx().getProjectPreferences().classTreePreferences.filter = filter;
        this.eventHandler.classFilterChangedEvent.emit();
    }
    setClassTreeRoot(rootUri: string) {
        Cookie.setCookie(Properties.pref_class_tree_root, rootUri, SVContext.getProjectCtx().getProject());
        SVContext.getProjectCtx().getProjectPreferences().classTreePreferences.rootClassUri = rootUri;
    }
    setClassTreeShowInstances(show: boolean) {
        Cookie.setCookie(Properties.pref_class_tree_show_instances, show, SVContext.getProjectCtx().getProject());
        SVContext.getProjectCtx().getProjectPreferences().classTreePreferences.showInstancesNumber = show;
    }

    //instance list settings
    setInstanceListVisualization(mode: InstanceListVisualizationMode) {
        Cookie.setCookie(Properties.pref_instance_list_visualization, mode, SVContext.getProjectCtx().getProject());
        SVContext.getProjectCtx().getProjectPreferences().instanceListPreferences.visualization = mode;
    }
    setInstanceLisSafeToGoLimit(limit: number) {
        Cookie.setCookie(Properties.pref_instance_list_safe_to_go_limit, limit + "", SVContext.getProjectCtx().getProject());
        let instanceListPref = SVContext.getProjectCtx().getProjectPreferences().instanceListPreferences;
        instanceListPref.safeToGoLimit = limit;
        instanceListPref.safeToGoMap = {}; //changing the limit invalidated the safe => reset the map
    }

    //concept tree settings
    setConceptTreeVisualization(mode: ConceptTreeVisualizationMode) {
        Cookie.setCookie(Properties.pref_concept_tree_visualization, mode, SVContext.getProjectCtx().getProject());
        SVContext.getProjectCtx().getProjectPreferences().conceptTreePreferences.visualization = mode;
    }
    setConceptTreeSafeToGoLimit(limit: number) {
        Cookie.setCookie(Properties.pref_concept_tree_safe_to_go_limit, limit, SVContext.getProjectCtx().getProject());
        let conceptTreePref = SVContext.getProjectCtx().getProjectPreferences().conceptTreePreferences;
        conceptTreePref.safeToGoLimit = limit;
        conceptTreePref.safeToGoMap = {}; //changing the limit invalidated the safe => reset the map
    }

    //lex entry list settings
    setLexicalEntryListVisualization(mode: LexEntryVisualizationMode) {
        Cookie.setCookie(Properties.pref_lex_entry_list_visualization, mode, SVContext.getProjectCtx().getProject());
        SVContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences.visualization = mode;
    }
    setLexicalEntryListIndexLenght(lenght: number) {
        Cookie.setCookie(Properties.pref_lex_entry_list_index_length, lenght, SVContext.getProjectCtx().getProject());
        SVContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences.indexLength = lenght;
    }
    setLexicalEntryListSafeToGoLimit(limit: number) {
        Cookie.setCookie(Properties.pref_lex_entry_list_safe_to_go_limit, limit, SVContext.getProjectCtx().getProject());
        let lexEntryListPref = SVContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences;
        lexEntryListPref.safeToGoLimit = limit;
        lexEntryListPref.safeToGoMap = {}; //changing the limit invalidated the safe => reset the map
    }

    //Graph settings
    setResourceViewPartitionFilter(pref: ResViewPartitionFilterPreference) {
        Cookie.setCookie(Properties.pref_res_view_partition_filter, JSON.stringify(pref), SVContext.getProjectCtx().getProject());
        SVContext.getProjectCtx().getProjectPreferences().resViewPartitionFilter = pref;
    }

    setHideLiteralGraphNodes(show: boolean) {
        SVContext.getProjectCtx().getProjectPreferences().hideLiteralGraphNodes = show;
        Cookie.setCookie(Properties.pref_filter_value_languages, show, SVContext.getProjectCtx().getProject());
    }


    /* =============================
    ==== PREFERENCES IN COOKIES ====
    ============================= */

    private initPreferencesCookie(projectCtx: ProjectContext) {
        let projectPreferences: ProjectPreferences = projectCtx.getProjectPreferences();
        let project: Project = projectCtx.getProject();

        //active scheme
        let activeSchemes = [];
        let activeSchemesPref: string = Cookie.getCookie(Properties.pref_active_schemes, project);
        if (activeSchemesPref != null) {
            let skSplitted: string[] = activeSchemesPref.split(",");
            for (let i = 0; i < skSplitted.length; i++) {
                activeSchemes.push(NTriplesUtil.parseIRI(skSplitted[i]));
            }
        }
        this.setActiveSchemes(projectCtx, activeSchemes);

        //active lexicon
        let activeLexicon = null;
        let activeLexiconPref: string = Cookie.getCookie(Properties.pref_active_lexicon, project);
        if (activeLexiconPref != null) {
            activeLexicon = NTriplesUtil.parseIRI(activeLexiconPref);
            this.setActiveLexicon(projectCtx, activeLexicon);
        }

        //show flag
        projectPreferences.showFlags = Cookie.getCookie(Properties.pref_show_flags, project) != "false";

        //graph & resView pref: filter value lang
        let filterValueLangPref = Cookie.getCookie(Properties.pref_filter_value_languages, project);
        if (filterValueLangPref == null) {
            projectPreferences.filterValueLang = { languages: [], enabled: false }; //default
        } else {
            projectPreferences.filterValueLang = JSON.parse(filterValueLangPref);
        }

        //graph preferences
        let rvPartitionFilterPref = Cookie.getCookie(Properties.pref_res_view_partition_filter, project);
        if (rvPartitionFilterPref != null) {
            projectPreferences.resViewPartitionFilter = JSON.parse(rvPartitionFilterPref);
        } else {
            let resViewPartitionFilter: ResViewPartitionFilterPreference = {};
            for (let role in RDFResourceRolesEnum) {
                resViewPartitionFilter[role] = [ResViewPartition.lexicalizations];
            }
            projectPreferences.resViewPartitionFilter = resViewPartitionFilter;
        }
        projectPreferences.hideLiteralGraphNodes = Cookie.getCookie(Properties.pref_hide_literal_graph_nodes, project) != "false";

        //cls tree preferences
        let classTreePreferences: ClassTreePreference = {
            showInstancesNumber: Cookie.getCookie(Properties.pref_class_tree_show_instances, project) == "true",
            rootClassUri: (projectCtx.getProject().getModelType() == RDFS.uri) ? RDFS.resource.getIRI() : OWL.thing.getIRI(),
            filter: new ClassTreeFilter()
        };
        let classTreeFilterPref: string = Cookie.getCookie(Properties.pref_class_tree_filter, project);
        if (classTreeFilterPref != null) {
            classTreePreferences.filter = JSON.parse(classTreeFilterPref);
        }
        let classTreeRootPref: string = Cookie.getCookie(Properties.pref_class_tree_root, project);
        if (classTreeRootPref != null) {
            classTreePreferences.rootClassUri = classTreeRootPref;
        }
        projectPreferences.classTreePreferences = classTreePreferences;

        //instance list preferences
        let instanceListPreferences: InstanceListPreference = projectPreferences.instanceListPreferences;
        //the visualization mode is taken from cookie only if there isn't any restriction on it or if the user is the admin/superuser
        if (SVContext.getLoggedUser().isSuperUser(false) || instanceListPreferences.allowVisualizationChange) {
            let instanceListVisualizationPref: string = Cookie.getCookie(Properties.pref_instance_list_visualization, project);
            if (instanceListVisualizationPref == InstanceListVisualizationMode.searchBased || instanceListVisualizationPref == InstanceListVisualizationMode.standard) {
                //overwrite only if the cookie value is an admitted value
                instanceListPreferences.visualization = instanceListVisualizationPref;
            }
        }
        let instanceListSafeToGoLimitPref: string = Cookie.getCookie(Properties.pref_instance_list_safe_to_go_limit, project);
        if (instanceListSafeToGoLimitPref != null) {
            instanceListPreferences.safeToGoLimit = parseInt(instanceListSafeToGoLimitPref);
        }
        projectPreferences.instanceListPreferences = instanceListPreferences;

        //concept tree preferences
        let conceptTreePref: ConceptTreePreference = projectPreferences.conceptTreePreferences;
        //the visualization mode is taken from cookie only if there isn't any restriction on it or if the user is the admin/superuser
        if (SVContext.getLoggedUser().isSuperUser(false) || conceptTreePref.allowVisualizationChange) {
            let conceptTreeVisualizationPref: string = Cookie.getCookie(Properties.pref_concept_tree_visualization, project);
            if (conceptTreeVisualizationPref == ConceptTreeVisualizationMode.searchBased || conceptTreeVisualizationPref == ConceptTreeVisualizationMode.hierarchyBased) {
                //overwrite only if the cookie value is an admitted value
                conceptTreePref.visualization = conceptTreeVisualizationPref;
            }
        }
        let conceptTreeSafeToGoLimitPref: string = Cookie.getCookie(Properties.pref_concept_tree_safe_to_go_limit, project);
        if (conceptTreeSafeToGoLimitPref != null) {
            conceptTreePref.safeToGoLimit = parseInt(conceptTreeSafeToGoLimitPref);
        }

        //lexical entry list preferences
        let lexEntryListPref: LexicalEntryListPreference = projectPreferences.lexEntryListPreferences;
        //the visualization mode is taken from cookie only if there isn't any restriction on it or if the user is the admin/superuser
        if (SVContext.getLoggedUser().isSuperUser(false) || lexEntryListPref.allowVisualizationChange) {
            let lexEntryListVisualizationPref: string = Cookie.getCookie(Properties.pref_lex_entry_list_visualization, project);
            if (lexEntryListVisualizationPref == LexEntryVisualizationMode.searchBased || lexEntryListVisualizationPref == LexEntryVisualizationMode.indexBased) {
                //overwrite only if the cookie value is an admitted value
                lexEntryListPref.visualization = lexEntryListVisualizationPref;
            }
        }
        //the index length is taken from cookie only if admin there isn't any restriction on it or if the user is the admin/superuser
        if (SVContext.getLoggedUser().isSuperUser(false) || lexEntryListPref.allowIndexLengthChange) {
            let lexEntryListIndexLenghtPref: string = Cookie.getCookie(Properties.pref_lex_entry_list_index_length, project);
            if (lexEntryListIndexLenghtPref == "1" || lexEntryListIndexLenghtPref == "2") {
                //overwrite only if the cookie value is an admitted value
                lexEntryListPref.indexLength = parseInt(lexEntryListIndexLenghtPref);
            }
        }
        let lexEntryListSafeToGoLimitPref: string = Cookie.getCookie(Properties.pref_lex_entry_list_safe_to_go_limit, project);
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
        Cookie.setCookie(Cookie.RES_VIEW_INCLUDE_INFERENCE, showInferred + "");
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
        Cookie.setCookie(Cookie.RES_VIEW_RENDERING, rendering + "");
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
        Cookie.setCookie(Cookie.SHOW_DEPRECATED, showDeprecated + "");
    }
    /**
     * Gets the preference to show the deprecated resources in the trees/lists
     */
    getShowDeprecated(): boolean {
        let cookieValue: string = Cookie.getCookie(Cookie.SHOW_DEPRECATED);
        return cookieValue != "false"; //default true
    }

    setHomeContent(homeContent: string): Observable<void> {
        SVContext.getSystemSettings().homeContent = homeContent;
        return this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM, SettingsEnum.homeContent, homeContent);
    }

    setSearchSettings(projectCtx: ProjectContext, settings: SearchSettings) {
        let projectPreferences: ProjectPreferences = projectCtx.getProjectPreferences();
        Cookie.setCookie(Cookie.SEARCH_STRING_MATCH_MODE, settings.stringMatchMode);
        Cookie.setCookie(Cookie.SEARCH_USE_URI, settings.useURI + "");
        Cookie.setCookie(Cookie.SEARCH_USE_LOCAL_NAME, settings.useLocalName + "");
        Cookie.setCookie(Cookie.SEARCH_USE_NOTES, settings.useNotes + "");
        Cookie.setCookie(Cookie.SEARCH_CONCEPT_SCHEME_RESTRICTION, settings.restrictActiveScheme + "");
        Cookie.setCookie(Cookie.SEARCH_LANGUAGES, JSON.stringify(settings.languages));
        Cookie.setCookie(Cookie.SEARCH_RESTRICT_LANG, settings.restrictLang + "");
        Cookie.setCookie(Cookie.SEARCH_INCLUDE_LOCALES, settings.includeLocales + "");
        Cookie.setCookie(Cookie.SEARCH_USE_AUTOMOMPLETION, settings.useAutocompletion + "");
        projectPreferences.searchSettings = settings;
        this.eventHandler.searchPrefsUpdatedEvent.emit();
    }

    initStartupSystemSettings(): Observable<void> {
        return this.settingsService.getStartupSettings().pipe(
            map(settings => {
                let systemSettings: SystemSettings = new SystemSettings();
                systemSettings.showFlags = settings.getPropertyValue(SettingsEnum.showFlags);
                systemSettings.homeContent = settings.getPropertyValue(SettingsEnum.homeContent);
                let systemLanguages: Language[] = settings.getPropertyValue(SettingsEnum.languages);
                Languages.sortLanguages(systemLanguages);
                systemSettings.languages = systemLanguages;
                systemSettings.disableContributions = settings.getPropertyValue(SettingsEnum.disableContributions);
                let authServiceValue = settings.getPropertyValue(SettingsEnum.authService);
                if (authServiceValue in AuthServiceMode) {
                    systemSettings.authService = authServiceValue;
                }
                SVContext.setSystemSettings(systemSettings);
            })
        );
    }

}