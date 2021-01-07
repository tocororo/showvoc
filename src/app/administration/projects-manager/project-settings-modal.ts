import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExtensionPointID } from 'src/app/models/Plugins';
import { Project } from 'src/app/models/Project';
import { ConceptTreeVisualizationMode, InstanceListVisualizationMode, LexEntryVisualizationMode, Properties, VisualizationModeTranslation } from 'src/app/models/Properties';
import { OntoLex, OWL, SKOS } from 'src/app/models/Vocabulary';
import { PreferencesSettingsServices } from 'src/app/services/preferences-settings.service';
import { InstanceListSettingsModal } from "src/app/structures/list/instance/instance-list-settings-modal";
import { ProjectContext } from 'src/app/utils/PMKIContext';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';

@Component({
    selector: "project-settings-modal",
    templateUrl: "./project-settings-modal.html",
})
export class ProjectSettingsModal {

    @Input() project: Project;
    projectCtx: ProjectContext;

    isOntolex: boolean; //useful to determine whether to show the settings about lexical entry list
    isSkos: boolean; //useful to determine whether to show the settings about concept tree
    isOwl: boolean; //useful to determine whether to show the settings about the instance list


    skosVisualizationModes: {value: ConceptTreeVisualizationMode, labelTranslationKey: string }[] = [
        { value: ConceptTreeVisualizationMode.hierarchyBased, labelTranslationKey: VisualizationModeTranslation.translationMap[ConceptTreeVisualizationMode.hierarchyBased] },
        { value: ConceptTreeVisualizationMode.searchBased, labelTranslationKey: VisualizationModeTranslation.translationMap[ConceptTreeVisualizationMode.searchBased] }
    ]
    selectedSkosMode: ConceptTreeVisualizationMode = this.skosVisualizationModes[0].value;
    skosAllowVisualizationChange: boolean;

    ontolexVisualizationModes: { value: LexEntryVisualizationMode, labelTranslationKey: string }[] = [
        { value: LexEntryVisualizationMode.indexBased, labelTranslationKey: VisualizationModeTranslation.translationMap[LexEntryVisualizationMode.indexBased] },
        { value: LexEntryVisualizationMode.searchBased, labelTranslationKey: VisualizationModeTranslation.translationMap[LexEntryVisualizationMode.searchBased] }
    ]
    selectedOntolexMode: LexEntryVisualizationMode = this.ontolexVisualizationModes[0].value;
    indexLength: number = 1;
    ontolexAllowVisualizationChange: boolean;
    ontolexAllowIndexLengthChange: boolean;

    instanceVisualizationModes: { value: InstanceListVisualizationMode, labelTranslationKey: string }[] = [
        { value: InstanceListVisualizationMode.standard, labelTranslationKey: VisualizationModeTranslation.translationMap[InstanceListVisualizationMode.standard] },
        { value: InstanceListVisualizationMode.searchBased, labelTranslationKey: VisualizationModeTranslation.translationMap[InstanceListVisualizationMode.searchBased] }
    ]
    selectedInstanceMode: InstanceListVisualizationMode = this.instanceVisualizationModes[0].value;
    instanceAllowVisualizationChange: boolean;
    
    renderingLangs: string[];

    constructor(public activeModal: NgbActiveModal, private pmkiProp: PMKIProperties, private prefService: PreferencesSettingsServices) { }

    ngOnInit() {
        this.isOntolex = this.project.getModelType() == OntoLex.uri;
        this.isSkos = this.project.getModelType() == SKOS.uri;
        this.isOwl = this.project.getModelType() == OWL.uri;
        
        this.projectCtx = new ProjectContext(this.project);
        this.pmkiProp.initProjectSettings(this.projectCtx).subscribe( //in order to get the languages of the project
            () => {
                this.initRenderingLanguages();
            }
        );

        if (this.isOntolex || this.isSkos || this.isOwl) {
            this.prefService.getPUSettings([
                Properties.pref_concept_tree_visualization, Properties.pref_concept_tree_allow_visualization_change,
                Properties.pref_instance_list_visualization, Properties.pref_instance_list_allow_visualization_change,
                Properties.pref_lex_entry_list_visualization, Properties.pref_lex_entry_allow_visualization_change, 
                Properties.pref_lex_entry_list_index_length, Properties.pref_lex_entry_allow_index_length_change], 
                this.project).subscribe(
                prefs => {
                    //concept tree
                    let conceptTreeVisualizationPref: string = prefs[Properties.pref_concept_tree_visualization];
                    if (conceptTreeVisualizationPref == ConceptTreeVisualizationMode.searchBased) {
                        this.selectedSkosMode = conceptTreeVisualizationPref;
                    }
                    this.skosAllowVisualizationChange = prefs[Properties.pref_concept_tree_allow_visualization_change] != "false";
                    //lex entry list
                    let lexEntryListVisualizationPref: string = prefs[Properties.pref_lex_entry_list_visualization];
                    if (lexEntryListVisualizationPref == LexEntryVisualizationMode.searchBased) {
                        this.selectedOntolexMode = lexEntryListVisualizationPref;
                    }
                    this.ontolexAllowVisualizationChange = prefs[Properties.pref_lex_entry_allow_visualization_change] != "false";
                    this.ontolexAllowIndexLengthChange = prefs[Properties.pref_lex_entry_allow_index_length_change] != "false";
                    this.indexLength = prefs[Properties.pref_lex_entry_list_index_length] == "2" ? 2 : 1;
                    //instance list
                    let instanceListVisualizationPref: string = prefs[Properties.pref_instance_list_visualization];
                    if (instanceListVisualizationPref == InstanceListVisualizationMode.searchBased) {
                        this.selectedInstanceMode = instanceListVisualizationPref;
                    }
                    this.instanceAllowVisualizationChange = prefs[Properties.pref_instance_list_allow_visualization_change] != "false";
                }
            );
        }
    }

    //======== Rendering settings handlers =======

    private initRenderingLanguages() {
        /*
         * The preference is retrieved from the PU-settings (specific settings for the given p-u pair, in this case the user is the admin), 
         * but it will be written as pu_default (default pu-setting at project level) so it will be applied for all the users (both admin and visitor).
         * The getPUSettings in case the setting has not been set before, will fallback to the pu_default
         */
        this.prefService.getPUSettings([Properties.pref_languages], this.project, ExtensionPointID.RENDERING_ENGINE_ID).subscribe(
            prefs => {
                this.renderingLangs = ["*"];
                if (prefs[Properties.pref_languages] != null) {
                    this.renderingLangs = prefs[Properties.pref_languages].split(",");
                }
            }
        );
    }

    onRenderingChange() {
        this.prefService.setPUSettingProjectDefault(Properties.pref_languages, this.renderingLangs.join(","), this.project, ExtensionPointID.RENDERING_ENGINE_ID).subscribe();
    }

    //======== Skos settings handlers ======

    changeSkosVisualizationMode() {
        this.prefService.setPUSettingProjectDefault(Properties.pref_concept_tree_visualization, this.selectedSkosMode, this.project).subscribe();
    }
    changeSkosAllowVisualizationChange() {
        this.skosAllowVisualizationChange = !this.skosAllowVisualizationChange;
        this.prefService.setPUSettingProjectDefault(Properties.pref_concept_tree_allow_visualization_change, this.skosAllowVisualizationChange+"", this.project).subscribe();
    }

    //======== Owl settings handlers ======

    changeInstanceVisualizationMode() {
        this.prefService.setPUSettingProjectDefault(Properties.pref_instance_list_visualization, this.selectedInstanceMode, this.project).subscribe();
    }
    changeInstanceAllowVisualizationChange() {
        this.instanceAllowVisualizationChange = !this.instanceAllowVisualizationChange;
        this.prefService.setPUSettingProjectDefault(Properties.pref_instance_list_allow_visualization_change, this.instanceAllowVisualizationChange+"", this.project).subscribe();
    }

    //======== Ontolex settings handlers ======

    changeOntolexVisualizationMode() {
        this.prefService.setPUSettingProjectDefault(Properties.pref_lex_entry_list_visualization, this.selectedOntolexMode, this.project).subscribe();
    }
    changeOntolexIndexLength() {
        this.prefService.setPUSettingProjectDefault(Properties.pref_lex_entry_list_index_length, this.indexLength+"", this.project).subscribe();
    }
    changeOntolexAllowVisualizationModeChage() {
        this.ontolexAllowVisualizationChange = !this.ontolexAllowVisualizationChange;
        this.prefService.setPUSettingProjectDefault(Properties.pref_lex_entry_allow_visualization_change, this.ontolexAllowVisualizationChange+"", this.project).subscribe();
    }
    changeOntolexAllowIndexLengthChange() {
        this.ontolexAllowIndexLengthChange = !this.ontolexAllowIndexLengthChange;
        this.prefService.setPUSettingProjectDefault(Properties.pref_lex_entry_allow_index_length_change, this.ontolexAllowIndexLengthChange+"", this.project).subscribe();
    }

    //==========================================
    
    close() {
        this.activeModal.dismiss();
    }

}