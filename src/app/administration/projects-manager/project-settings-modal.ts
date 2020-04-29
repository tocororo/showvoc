import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExtensionPointID } from 'src/app/models/Plugins';
import { Project } from 'src/app/models/Project';
import { Properties } from 'src/app/models/Properties';
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

    renderingLangs: string[];

    constructor(public activeModal: NgbActiveModal, private pmkiProp: PMKIProperties, private prefService: PreferencesSettingsServices) { }

    ngOnInit() {
        this.projectCtx = new ProjectContext(this.project);
        this.pmkiProp.initProjectSettings(this.projectCtx).subscribe( //in order to get the languages of the project
            () => {
                this.initRenderingLanguages();
            }
        );
    }

    private initRenderingLanguages() {
        /*
         * The preference is retrieved from the PU-settings (specific settings for the given p-u pair, in this case the user is the admin), 
         * but it will be written as pu_default (default pu-setting at project level) so it will be applied for all the users (both admina and visitor).
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

    close() {
        this.activeModal.dismiss();
    }

}