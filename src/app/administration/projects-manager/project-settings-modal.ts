import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExtensionPointID } from 'src/app/models/Plugins';
import { Project } from 'src/app/models/Project';
import { ConceptTreeVisualizationMode, LexEntryVisualizationMode, Properties } from 'src/app/models/Properties';
import { OntoLex, SKOS } from 'src/app/models/Vocabulary';
import { PreferencesSettingsServices } from 'src/app/services/preferences-settings.service';
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

    skosVisualizationModes: { label: string, value: ConceptTreeVisualizationMode }[] = [
        { label: "Hierarchy based", value: ConceptTreeVisualizationMode.hierarchyBased },
        { label: "Search based", value: ConceptTreeVisualizationMode.searchBased }
    ]
    selectedSkosMode: ConceptTreeVisualizationMode = this.skosVisualizationModes[0].value;
    skosAllowVisualizationChange: boolean;

    ontolexVisualizationModes: { label: string, value: LexEntryVisualizationMode }[] = [
        { label: "Index based", value: LexEntryVisualizationMode.indexBased },
        { label: "Search based", value: LexEntryVisualizationMode.searchBased }
    ]
    selectedOntolexMode: LexEntryVisualizationMode = this.ontolexVisualizationModes[0].value;
    indexLength: number = 1;
    ontolexAllowVisualizationChange: boolean;
    ontolexAllowIndexLengthChange: boolean;
    
    
    renderingLangs: string[];

    constructor(public activeModal: NgbActiveModal, private pmkiProp: PMKIProperties, private prefService: PreferencesSettingsServices) { }

    ngOnInit() {
        this.isOntolex = this.project.getModelType() == OntoLex.uri;
        this.isSkos = this.project.getModelType() == SKOS.uri;
        
        this.projectCtx = new ProjectContext(this.project);
        this.pmkiProp.initProjectSettings(this.projectCtx).subscribe( //in order to get the languages of the project
            () => {
                this.initRenderingLanguages();
            }
        );

        if (this.isOntolex || this.isSkos) {
            this.prefService.getPUSettings([Properties.pref_concept_tree_visualization, Properties.pref_concept_tree_allow_visualization_change,
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