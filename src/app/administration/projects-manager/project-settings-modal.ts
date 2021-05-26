import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExtensionPointID, Scope } from 'src/app/models/Plugins';
import { Project } from 'src/app/models/Project';
import { ConceptTreePreference, ConceptTreeVisualizationMode, InstanceListPreference, InstanceListVisualizationMode, LexEntryVisualizationMode, LexicalEntryListPreference, PreferencesUtils, SettingsEnum, VisualizationModeTranslation } from 'src/app/models/Properties';
import { OntoLex, OWL, SKOS } from 'src/app/models/Vocabulary';
import { SettingsServices } from "src/app/services/settings.service";
import { ProjectContext } from 'src/app/utils/SVContext';
import { SVProperties } from 'src/app/utils/SVProperties';

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


    private concTreePref: ConceptTreePreference;
    skosVisualizationModes: {value: ConceptTreeVisualizationMode, labelTranslationKey: string }[] = [
        { value: ConceptTreeVisualizationMode.hierarchyBased, labelTranslationKey: VisualizationModeTranslation.translationMap[ConceptTreeVisualizationMode.hierarchyBased] },
        { value: ConceptTreeVisualizationMode.searchBased, labelTranslationKey: VisualizationModeTranslation.translationMap[ConceptTreeVisualizationMode.searchBased] }
    ]
    selectedSkosMode: ConceptTreeVisualizationMode = this.skosVisualizationModes[0].value;
    skosAllowVisualizationChange: boolean;

    private lexEntryListPref: LexicalEntryListPreference;
    ontolexVisualizationModes: { value: LexEntryVisualizationMode, labelTranslationKey: string }[] = [
        { value: LexEntryVisualizationMode.indexBased, labelTranslationKey: VisualizationModeTranslation.translationMap[LexEntryVisualizationMode.indexBased] },
        { value: LexEntryVisualizationMode.searchBased, labelTranslationKey: VisualizationModeTranslation.translationMap[LexEntryVisualizationMode.searchBased] }
    ]
    selectedOntolexMode: LexEntryVisualizationMode = this.ontolexVisualizationModes[0].value;
    indexLength: number = 1;
    ontolexAllowVisualizationChange: boolean;
    ontolexAllowIndexLengthChange: boolean;

    private instListPref: InstanceListPreference;
    instanceVisualizationModes: { value: InstanceListVisualizationMode, labelTranslationKey: string }[] = [
        { value: InstanceListVisualizationMode.standard, labelTranslationKey: VisualizationModeTranslation.translationMap[InstanceListVisualizationMode.standard] },
        { value: InstanceListVisualizationMode.searchBased, labelTranslationKey: VisualizationModeTranslation.translationMap[InstanceListVisualizationMode.searchBased] }
    ]
    selectedInstanceMode: InstanceListVisualizationMode = this.instanceVisualizationModes[0].value;
    instanceAllowVisualizationChange: boolean;
    
    renderingLangs: string[];

    constructor(public activeModal: NgbActiveModal, private svProp: SVProperties, private settingsService: SettingsServices) { }


    /*
    * Here the preferences are retrieved from the PU-settings (specific settings for the given p-u pair, in this case the user is the admin), 
    * but it will be written as pu_default (default pu-setting at project level) so it will be applied for all the users (both admin and visitor).
    * The getSettings in case the setting has not been set before, will fallback to the pu_default
    */

    ngOnInit() {
        this.isOntolex = this.project.getModelType() == OntoLex.uri;
        this.isSkos = this.project.getModelType() == SKOS.uri;
        this.isOwl = this.project.getModelType() == OWL.uri;
        
        this.projectCtx = new ProjectContext(this.project);
        this.svProp.initProjectSettings(this.projectCtx).subscribe( //in order to get the languages of the project
            () => {
                this.initRenderingLanguages();
            }
        );

        if (this.isOntolex || this.isSkos || this.isOwl) {
            this.settingsService.getSettingsForProjectAdministration(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER, this.project).subscribe(
                settings => {
                    this.concTreePref = new ConceptTreePreference();
                    let concTreeSetting: ConceptTreePreference = settings.getPropertyValue(SettingsEnum.conceptTree);
                    if (concTreeSetting != null) {
                        PreferencesUtils.mergePreference(this.concTreePref, concTreeSetting);
                    }
                    this.selectedSkosMode = this.concTreePref.visualization;
                    this.skosAllowVisualizationChange = this.concTreePref.allowVisualizationChange;

                    this.instListPref = new InstanceListPreference();
                    let instListSetting: InstanceListPreference = settings.getPropertyValue(SettingsEnum.instanceList);
                    if (instListSetting != null) {
                        PreferencesUtils.mergePreference(this.instListPref, instListSetting);
                    }
                    this.selectedInstanceMode = this.instListPref.visualization;
                    this.instanceAllowVisualizationChange = this.instListPref.allowVisualizationChange;
                    
                    this.lexEntryListPref = new LexicalEntryListPreference();
                    let lexEntrySetting: LexicalEntryListPreference = settings.getPropertyValue(SettingsEnum.lexEntryList);
                    if (lexEntrySetting != null) {
                        PreferencesUtils.mergePreference(this.lexEntryListPref, lexEntrySetting);
                    }
                    this.selectedOntolexMode = this.lexEntryListPref.visualization;
                    this.ontolexAllowVisualizationChange = this.lexEntryListPref.allowVisualizationChange;
                    this.ontolexAllowIndexLengthChange = this.lexEntryListPref.allowIndexLengthChange;
                }
            )
        }
    }

    //======== Rendering settings handlers =======

    private initRenderingLanguages() {
        this.settingsService.getSettingsForProjectAdministration(ExtensionPointID.RENDERING_ENGINE_ID, Scope.PROJECT_USER, this.project).subscribe(
            settings => {
                this.renderingLangs = ["*"];
                let langSetting = settings.getPropertyValue(SettingsEnum.languages);
                if (langSetting != null) {
                    this.renderingLangs = langSetting.split(",");
                }
            }
        );
    }

    onRenderingChange() {
        this.settingsService.storePUSettingProjectDefault(ExtensionPointID.RENDERING_ENGINE_ID, this.project, SettingsEnum.languages, this.renderingLangs.join(",")).subscribe();
    }

    //======== Skos settings handlers ======

    changeSkosVisualizationMode() {
        this.concTreePref.visualization = this.selectedSkosMode;
        this.settingsService.storePUSettingProjectDefault(ExtensionPointID.ST_CORE_ID, this.project, SettingsEnum.conceptTree, this.concTreePref).subscribe();
    }
    changeSkosAllowVisualizationChange() {
        this.skosAllowVisualizationChange = !this.skosAllowVisualizationChange;
        this.concTreePref.allowVisualizationChange = this.skosAllowVisualizationChange;
        this.settingsService.storePUSettingProjectDefault(ExtensionPointID.ST_CORE_ID, this.project, SettingsEnum.conceptTree, this.concTreePref).subscribe();
    }

    //======== Owl settings handlers ======

    changeInstanceVisualizationMode() {
        this.instListPref.visualization = this.selectedInstanceMode;
        this.settingsService.storePUSettingProjectDefault(ExtensionPointID.ST_CORE_ID, this.project, SettingsEnum.instanceList, this.instListPref).subscribe();
    }
    changeInstanceAllowVisualizationChange() {
        this.instanceAllowVisualizationChange = !this.instanceAllowVisualizationChange;
        this.instListPref.allowVisualizationChange = this.instanceAllowVisualizationChange;
        this.settingsService.storePUSettingProjectDefault(ExtensionPointID.ST_CORE_ID, this.project, SettingsEnum.instanceList, this.instListPref).subscribe();
    }

    //======== Ontolex settings handlers ======

    changeOntolexVisualizationMode() {
        this.lexEntryListPref.visualization = this.selectedOntolexMode;
        this.settingsService.storePUSettingProjectDefault(ExtensionPointID.ST_CORE_ID, this.project, SettingsEnum.lexEntryList, this.lexEntryListPref).subscribe();
    }
    changeOntolexIndexLength() {
        this.lexEntryListPref.indexLength = this.indexLength;
        this.settingsService.storePUSettingProjectDefault(ExtensionPointID.ST_CORE_ID, this.project, SettingsEnum.lexEntryList, this.lexEntryListPref).subscribe();
    }
    changeOntolexAllowVisualizationModeChage() {
        this.ontolexAllowVisualizationChange = !this.ontolexAllowVisualizationChange;
        this.lexEntryListPref.allowVisualizationChange = this.ontolexAllowVisualizationChange;
        this.settingsService.storePUSettingProjectDefault(ExtensionPointID.ST_CORE_ID, this.project, SettingsEnum.lexEntryList, this.lexEntryListPref).subscribe();
    }
    changeOntolexAllowIndexLengthChange() {
        this.ontolexAllowIndexLengthChange = !this.ontolexAllowIndexLengthChange;
        this.lexEntryListPref.allowIndexLengthChange = this.ontolexAllowIndexLengthChange;
        this.settingsService.storePUSettingProjectDefault(ExtensionPointID.ST_CORE_ID, this.project, SettingsEnum.lexEntryList, this.lexEntryListPref).subscribe();
    }

    //==========================================
    
    close() {
        this.activeModal.dismiss();
    }

}