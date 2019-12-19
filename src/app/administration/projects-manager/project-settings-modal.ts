import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Language } from 'src/app/models/LanguagesCountries';
import { ExtensionPointID } from 'src/app/models/Plugins';
import { Project } from 'src/app/models/Project';
import { Properties } from 'src/app/models/Properties';
import { PreferencesSettingsServices } from 'src/app/services/preferences-settings.service';
import { PMKIContext, ProjectContext } from 'src/app/utils/PMKIContext';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';

@Component({
    selector: "project-settings-modal",
    templateUrl: "./project-settings-modal.html",
})
export class ProjectSettingsModal {

    @Input() project: Project;

    projectLanguages: Language[];
    renderingLanguages: LanguageItem[];

    sortOrder: SortOrder = SortOrder.ISO_CODE_ASCENDING;

    constructor(public activeModal: NgbActiveModal, private pmkiProp: PMKIProperties, private prefService: PreferencesSettingsServices) { }

    ngOnInit() {
        let projectCtx: ProjectContext = new ProjectContext(this.project);
        this.pmkiProp.initProjectSettings(projectCtx).subscribe( //in order to get the languages of the project
            () => {
                this.projectLanguages = projectCtx.getProjectSettings().projectLanguagesSetting;
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
                let languagesPref: string[] = ["*"];
                if (prefs[Properties.pref_languages] != null) {
                    languagesPref = prefs[Properties.pref_languages].split(",");
                }
                this.renderingLanguages = [];
                
                if (languagesPref.length == 1 && languagesPref[0] == "*") { //"*" stands for all languages
                    //set as active renderingLangs all the available langs (active false for all, that is equivalent to *)
                    this.projectLanguages.forEach(l => {
                        this.renderingLanguages.push({
                            lang: l,
                            active: false,
                            position: null
                        });
                    });
                } else {
                    //set as active renderingLangs only those listed by the preference
                    this.projectLanguages.forEach(l => {
                        this.renderingLanguages.push({
                            lang: l,
                            active: (languagesPref.indexOf(l.tag) != -1), //active if the language is among those listed in preferences
                            position: null
                        });
                    });
                    //set the positions according to the preference order
                    let position: number = 1; //here I didn't exploit index i since a lang in preferences could be not in the project langs
                    languagesPref.forEach(langTag => {
                        this.renderingLanguages.forEach((lang: LanguageItem) => {
                            if (lang.lang.tag == langTag) {
                                lang.position = position;
                                return;
                            }
                        })
                        position++;
                    })
                }
            }
        );
    }

    close() {
        PMKIContext.removeTempProject();
        this.activeModal.dismiss();
    }


    /** =================
     * languages handlers
     * ================= */

    private changeAllLangStatus(checked: boolean) {
        if (checked) {
            //if it's activating all the languages, position the new activated langs after the already active
            let lastPosition: number = this.countActiveLangs();
            this.renderingLanguages.forEach(l => {
                if (!l.active) { //only if not yet active update active and position
                    l.active = checked;
                    l.position = lastPosition+1;
                    lastPosition++;
                }
            })
        } else {
            this.renderingLanguages.forEach(l => {
                l.active = checked;
                l.position = null;
            });
        }
        this.updateLanguagesPref();
    }

    private updateLanguagesPref() {
        //collect the active languages to set in the preference
        let preferenceLangs: string[] = [];
        let activeLangs: LanguageItem[] = this.getActiveLanguageItems();
        //sort active langs by position
        activeLangs.sort((l1: LanguageItem, l2: LanguageItem) => {
            if (l1.position > l2.position) return 1;
            if (l1.position < l2.position) return -1;
            return 0;
        });

        if (activeLangs.length == 0) { //no language checked
            preferenceLangs = ["*"];
        } else {
            activeLangs.forEach(l => {
                preferenceLangs.push(l.lang.tag);
            })
        }
        //update the setting for both admin and visitor
        this.prefService.setPUSettingProjectDefault(Properties.pref_languages, preferenceLangs.join(","), this.project, ExtensionPointID.RENDERING_ENGINE_ID).subscribe();
    }
    
    private changePositionOrder() {
        if (this.sortOrder == SortOrder.POSITION_ASCENDING) {
            this.sortOrder = SortOrder.POSITION_DESCENDING;
            this.renderingLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                if (l1.position == null && l2.position == null) {
                    return l1.lang.tag.localeCompare(l2.lang.tag);
                } else if (l1.position != null && l2.position == null) {
                    return -1;
                } else if (l1.position == null && l2.position != null) {
                    return 1;
                }
                if (l1.position > l2.position) return -1;
                if (l1.position < l2.position) return 1;
                return 0;
            });
        } else { //in case is positionDescending or any other order active
            this.sortOrder = SortOrder.POSITION_ASCENDING;
            this.renderingLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                if (l1.position == null && l2.position == null) {
                    return l1.lang.tag.localeCompare(l2.lang.tag);
                } else if (l1.position != null && l2.position == null) {
                    return -1;
                } else if (l1.position == null && l2.position != null) {
                    return 1;
                }
                if (l1.position > l2.position) return 1;
                if (l1.position < l2.position) return -1;
                return 0;
            });
        }
    }
    private changeIsocodeOrder() {
        if (this.sortOrder == SortOrder.ISO_CODE_ASCENDING) {
            this.sortOrder = SortOrder.ISO_CODE_DESCENDING;
            this.renderingLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return -l1.lang.tag.localeCompare(l2.lang.tag);
            });
        } else { //in case is isocodeDescending or any other order active
            this.sortOrder = SortOrder.ISO_CODE_ASCENDING;
            this.renderingLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return l1.lang.tag.localeCompare(l2.lang.tag);
            });
        }
    }
    private changeLanguageOrder() {
        if (this.sortOrder == SortOrder.LANGUAGE_ASCENDING) {
            this.sortOrder = SortOrder.LANGUAGE_DESCENDING;
            this.renderingLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return -l1.lang.name.localeCompare(l2.lang.name);
            });
        } else { //in case is positionDescending or any other order active
            this.sortOrder = SortOrder.LANGUAGE_ASCENDING;
            this.renderingLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return l1.lang.name.localeCompare(l2.lang.name);
            });
        }
    }

    private onPositionChange(langItem: LanguageItem, newPositionValue: string) {
        let newPosition: number = parseInt(newPositionValue);
        for (var i = 0; i < this.renderingLanguages.length; i++) {
            //swap the position between the changed language and the language that was in the "newPosition"
            if (this.renderingLanguages[i].position == newPosition) {
                this.renderingLanguages[i].position = langItem.position;
                langItem.position = newPosition;
                break;
            }
        }
        this.updateLanguagesPref();
    }

    private onActiveChange(langItem: LanguageItem) {
        //if it is activating the language, set its position as last
        if (langItem.active) {
            langItem.position = this.countActiveLangs();
        } else { 
            //if deactivating language, remove position to the deactivated lang...
            let deactivatedPosition: number = langItem.position;
            langItem.position = null;
            //...and shift the position of the languages that follow the deactivated
            this.renderingLanguages.forEach(l => {
                if (l.position > deactivatedPosition) {
                    l.position = l.position-1;
                }
            })

        }
        this.updateLanguagesPref();
    }

    //Utils 

    private getActiveLanguageItems(): LanguageItem[] {
        let activeLangs: LanguageItem[] = [];
        if (this.renderingLanguages != null) {
            activeLangs = this.renderingLanguages.filter(l => l.active);
        }
        return activeLangs;
    }

    private countActiveLangs(): number {
        return this.getActiveLanguageItems().length;
    }

}

/**
 * Support class that represent a list item of the languages preference
 */
class LanguageItem {
    public lang: Language;
    public active: boolean;
    public position: number;
}

class SortOrder {
    public static POSITION_DESCENDING: string = "position_descending";
    public static POSITION_ASCENDING: string = "position_ascending";
    public static ISO_CODE_DESCENDING: string = "isocode_descending";
    public static ISO_CODE_ASCENDING: string = "isocode_ascending";
    public static LANGUAGE_DESCENDING: string = "language_descending";
    public static LANGUAGE_ASCENDING: string = "language_ascending";
}