import { Language } from './LanguagesCountries';
import { IRI } from './Resources';
import { ResViewPartition } from './ResourceView';
import { OWL, RDF, RDFS } from './Vocabulary';

export class Properties {

    static pref_languages: string = "languages";

    static pref_filter_value_languages: string = "filter_value_languages";

    static pref_active_schemes: string = "active_schemes";
    static pref_active_lexicon: string = "active_lexicon";
    static pref_show_flags: string = "show_flags";

    static pref_class_tree_show_instances: string = "class_tree.show_instances";
    static pref_class_tree_root: string = "class_tree.root";
    static pref_class_tree_filter: string = "class_tree.filter";
    
    static pref_concept_tree_visualization: string = "concept_tree_visualization";
    static pref_concept_tree_safe_to_go_limit: string = "concept_tree_safe_to_go_limit";
    static pref_concept_tree_allow_visualization_change: string = "concept_tree_allow_visualization_change";

    static pref_lex_entry_list_visualization: string = "lex_entry_list_visualization";
    static pref_lex_entry_list_index_length: string = "lex_entry_list_index_length";
    static pref_lex_entry_list_safe_to_go_limit: string = "lex_entry_list_safe_to_go_limit";
    static pref_lex_entry_allow_visualization_change: string = "lex_entry_allow_visualization_change";
    static pref_lex_entry_allow_index_length_change: string = "lex_entry_allow_index_length_change";

    static pref_search_languages: string = "search_languages";
    static pref_search_restrict_lang: string = "search_restrict_lang";
    static pref_search_include_locales: string = "search_include_locales";
    static pref_search_use_autocomplete: string = "search_use_autocomplete";

    static pref_res_view_partition_filter: string = "res_view_partition_filter";
    static pref_hide_literal_graph_nodes: string = "hide_literal_graph_nodes";

    //project
    static setting_languages: string = "languages";

    //system
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
    public classIndividualSearchMode: ClassIndividualPanelSearchMode = ClassIndividualPanelSearchMode.all;
}

export enum SearchMode {
    startsWith = "startsWith",
    contains = "contains",
    endsWith = "endsWith",
    exact = "exact",
    fuzzy = "fuzzy"
}

export enum ClassIndividualPanelSearchMode {
    onlyClasses = "onlyClasses",
    onlyInstances = "onlyInstances",
    all = "all"
}

export class ClassTreePreference {
    showInstancesNumber: boolean;
    rootClassUri: string;
    filter: ClassTreeFilter;
}
export class ClassTreeFilter {
    enabled: boolean = true;
    map: { [key: string]: string[] } = { //map where keys are the URIs of a class and the values are the URIs of the subClasses to filter out
        [RDFS.resource.getIRI()]: [ 
            OWL.allDifferent.getIRI(), OWL.allDisjointClasses.getIRI(), OWL.allDisjointProperties.getIRI(),
            OWL.annotation.getIRI(), OWL.axiom.getIRI(), OWL.negativePropertyAssertion.getIRI(), OWL.ontology.getIRI(),
            RDF.list.getIRI(), RDF.property.getIRI(), RDF.statement.getIRI(),
            RDFS.class.getIRI(), RDFS.container.getIRI(), RDFS.literal.getIRI(),
        ],
        [OWL.thing.getIRI()]: [ OWL.nothing.getIRI(), OWL.namedIndividual.getIRI()]
    }
}

export class ConceptTreePreference {
    visualization: ConceptTreeVisualizationMode = ConceptTreeVisualizationMode.hierarchyBased;
    allowVisualizationChange: boolean = true;
    safeToGoLimit: number = 1000;
    safeToGoMap: SafeToGoMap = {}; //this is not a preference, but it is cached with them since it is contextual to the project 
}

/**
 * checksum: string - it is a representation of the request params (it could be a concat of the params serialization)
 * safe: boolean tells if the tree/list is safe to be initialized, namely if the amount of elements (root/items) are under a safety limit
 */
export interface SafeToGoMap { [checksum: string]: SafeToGo };
export interface SafeToGo { safe: boolean, count?: number };

export enum ConceptTreeVisualizationMode {
    searchBased = "searchBased",
    hierarchyBased = "hierarchyBased"
}

export class LexicalEntryListPreference {
    visualization: LexEntryVisualizationMode = LexEntryVisualizationMode.indexBased;
    allowVisualizationChange: boolean = true;
    allowIndexLengthChange: boolean = true;
    indexLength: number = 1;
    safeToGoLimit: number = 1000;
    safeToGoMap: SafeToGoMap = {}; //this is not a preference, but it is cached with them since it is contextual to the project 
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
    projectLanguagesPreference: string[] = []; //languages that user has assigned for project (and ordered according his preferences)

    filterValueLang: ValueFilterLanguages = new ValueFilterLanguages(); //languages visible in resource description (e.g. in ResourceView, Graph,...)

    activeSchemes: IRI[] = [];
    activeLexicon: IRI;
    showFlags: boolean = true;
    projectThemeId: number = null;

    classTreePreferences: ClassTreePreference;
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
    showFlags: boolean = true;
}

export class VisualizationModeTranslation {
    static translationMap: {[key: string]: string} = {
        [ConceptTreeVisualizationMode.hierarchyBased]: "DATA.COMMONS.VISUALIZATION_MODE.HIERARCHY_BASED",
        [ConceptTreeVisualizationMode.searchBased]: "DATA.COMMONS.VISUALIZATION_MODE.SEARCH_BASED",
        [LexEntryVisualizationMode.indexBased]: "DATA.COMMONS.VISUALIZATION_MODE.INDEX_BASED",
        [LexEntryVisualizationMode.searchBased]: "DATA.COMMONS.VISUALIZATION_MODE.SEARCH_BASED",
    }
}