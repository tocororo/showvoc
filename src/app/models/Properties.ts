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
}

export class SearchSettings {
    public stringMatchMode: SearchMode;
    public useURI: boolean;
    public useLocalName: boolean;
    public useNotes: boolean;
    public restrictLang: boolean;
    public languages: string[];
    public includeLocales: boolean;
    public useAutocompletion: boolean;
    public restrictActiveScheme: boolean;
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
    visualization: ConceptTreeVisualizationMode;
}

export enum ConceptTreeVisualizationMode {
    searchBased = "searchBased",
    hierarchyBased = "hierarchyBased"
}

export class LexicalEntryListPreference {
    visualization: LexEntryVisualizationMode;
    indexLength: number;
}

export enum LexEntryVisualizationMode {
    searchBased = "searchBased",
    indexBased = "indexBased"
}

export class ValueFilterLanguages {
    languages: string[];
    enabled: boolean;
}

export class ResViewPartitionFilterPreference {
    [role: string]: ResViewPartition[]; //role is a RDFResourceRoleEnum, values are only the hidden partitions
}