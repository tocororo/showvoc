import { Language } from './LanguagesCountries';
import { IRI } from './Resources';
import { ResViewPartition } from './ResourceView';

export class Properties {

    static pref_filter_value_languages: string = "filter_value_languages";

    static pref_active_schemes: string = "active_schemes";
    static pref_active_lexicon: string = "active_lexicon";
    static pref_show_flags: string = "show_flags";

    static pref_concept_tree_visualization: string = "concept_tree_visualization";

    static pref_lex_entry_list_visualization: string = "lex_entry_list_visualization";
    static pref_lex_entry_list_index_lenght: string = "lex_entry_list_index_lenght";

    static pref_search_languages: string = "search_languages";
    static pref_search_restrict_lang: string = "search_restrict_lang";
    static pref_search_include_locales: string = "search_include_locales";
    static pref_search_use_autocomplete: string = "search_use_autocomplete";

    static pref_res_view_partition_filter: string = "res_view_partition_filter";
    static pref_hide_literal_graph_nodes: string = "hide_literal_graph_nodes";

    static setting_languages: string = "languages";
    static setting_remote_configs = "remote_configs";

    static setting_vb_connection = "pmki.vb_connection_config";
}

export class SearchSettings {
    public stringMatchMode: SearchMode = SearchMode.startsWith;
    public useURI: boolean = false;
    public useLocalName: boolean = true;
    public useNotes: boolean = false;
    public restrictLang: boolean = false;
    public languages: string[] = [];
    public includeLocales: boolean = false;
    public useAutocompletion: boolean = false;
    public restrictActiveScheme: boolean = true;
}

export enum SearchMode {
    startsWith = "startsWith",
    contains = "contains",
    endsWith = "endsWith",
    exact = "exact",
    fuzzy = "fuzzy"
}

export class ConceptTreePreference {
    // baseBroaderUri: string;
    // broaderProps: string[];
    // narrowerProps: string[];
    // includeSubProps: boolean; //tells if the hierarchy should consider
    // syncInverse: boolean; //tells if the narrower/broader properties should be synced with their inverse
    visualization: ConceptTreeVisualizationMode = ConceptTreeVisualizationMode.hierarchyBased;
}

export enum ConceptTreeVisualizationMode {
    searchBased = "searchBased",
    hierarchyBased = "hierarchyBased"
}

export class LexicalEntryListPreference {
    visualization: LexEntryVisualizationMode = LexEntryVisualizationMode.indexBased;
    indexLength: number = 1;
}

export enum LexEntryVisualizationMode {
    searchBased = "searchBased",
    indexBased = "indexBased"
}

export class ValueFilterLanguages {
    languages: string[] = [];
    enabled: boolean = false;
}

export class ResViewPartitionFilterPreference {
    [role: string]: ResViewPartition[]; //role is a RDFResourceRoleEnum, values are only the hidden partitions
}

/**
 * Class that represents the user settings (preferences) of a Project 
 */
export class ProjectPreferences {
    filterValueLang: ValueFilterLanguages = new ValueFilterLanguages(); //languages visible in resource description (e.g. in ResourceView, Graph,...)

    activeSchemes: IRI[] = [];
    activeLexicon: IRI;
    showFlags: boolean = true;
    showInstancesNumber: boolean = true;
    projectThemeId: number = null;

    conceptTreePreferences: ConceptTreePreference;
    lexEntryListPreferences: LexicalEntryListPreference;

    //graph preferences
    resViewPartitionFilter: ResViewPartitionFilterPreference;
    hideLiteralGraphNodes: boolean = true;

    searchSettings: SearchSettings;

}

/**
 * Class that represents the settings of a project (user indipendent)
 */
export class ProjectSettings {
    projectLanguagesSetting: Language[] = []; //all available languages in a project (settings)
}

/**
 * Class that represents the global application settings
 */
export class SystemSettings {
    showFlags: boolean;
}