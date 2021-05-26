import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Properties } from 'src/app/models/Properties';
import { Cookie } from 'src/app/utils/Cookie';
import { SVContext } from 'src/app/utils/SVContext';
import { Project } from 'src/app/models/Project';

@Component({
    selector: "rendering-editor-modal",
    templateUrl: "./rendering-editor-modal.html",
})
export class RenderingEditorModal {

    project: Project;

    defaultPrefLangs: string[]; //languages assigned by default to the user
    cookieLangs: string[]; //languages that user set for itself as cookie

    renderingLangs: string[];

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
        this.project = SVContext.getWorkingProject();
        this.initLanguages();
    }

    initLanguages() {
        let cookieValue = Cookie.getUserProjectCookiePref(Properties.pref_languages, this.project);
        this.cookieLangs = (cookieValue != null) ? cookieValue.split(",") : null;
        this.defaultPrefLangs = SVContext.getProjectCtx().getProjectPreferences().renderingLanguagesPreference;
        if (this.defaultPrefLangs.length == 1 && this.defaultPrefLangs[0] == "*") {
            this.defaultPrefLangs = null;
        }
        //use as rendering langugages those languages set in cookie by the user, if not defined, fallback to the preference.
        this.renderingLangs = (this.cookieLangs != null) ? this.cookieLangs : this.defaultPrefLangs;
    }

    onRenderingChange() {
        //changes made from this modal affects only the languages stored in cookie
        let value: string = (this.renderingLangs.length == 0) ? "*" : this.renderingLangs.join(",");
        Cookie.setUserProjectCookiePref(Properties.pref_languages, this.project, value);
        this.initLanguages();
    }

    restoreDefault() {
        Cookie.setUserProjectCookiePref(Properties.pref_languages, SVContext.getProjectCtx().getProject(), null); //delete cookie langs
        this.initLanguages();
    }

    close() {
        this.activeModal.dismiss();
    }

}