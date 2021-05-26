import { Component, forwardRef, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Language } from 'src/app/models/LanguagesCountries';
import { SVContext, ProjectContext } from 'src/app/utils/SVContext';

@Component({
    selector: "rendering-editor",
    templateUrl: "./rendering-editor.component.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RenderingEditor), multi: true,
    }],
    host: { class: "vbox" }
})
export class RenderingEditor implements ControlValueAccessor {

    @Input() projectCtx: ProjectContext; //if provided, retrieve the project languages from it (not from the SVContext project)
    @Input() alert: string; //if provided, show an alert containing the given message

    projectLanguages: Language[];
    renderingLanguages: LanguageItem[];

    sortOrder: SortOrder = SortOrder.POSITION_ASCENDING;

    constructor() { }

    ngOnInit() {
        if (this.projectCtx != null) {
            this.projectLanguages = this.projectCtx.getProjectSettings().projectLanguagesSetting;
        } else {
            this.projectLanguages = SVContext.getProjectCtx().getProjectSettings().projectLanguagesSetting;
        }
    }

    /**
     * When the ngModel bound variable updates, initializes the language items
     * @param languages could be an empty list (no language active), a list of only ["*"] (all languages) or a list of the active language tags
     */
    private initLanguageItems(languages: string[]) {
        this.renderingLanguages = [];
        if (languages == null || (languages.length == 1 && languages[0] == "*")) { //"*" stands for all languages
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
                    active: (languages.indexOf(l.tag) != -1), //active if the language is among those listed in preferences
                    position: null
                });
            });
            //set the positions according to the preference order
            let position: number = 1; //here I didn't exploit index i since a lang in preferences could be not in the project langs
            languages.forEach(langTag => {
                this.renderingLanguages.forEach((lang: LanguageItem) => {
                    if (lang.lang.tag == langTag) {
                        lang.position = position;
                        return;
                    }
                })
                position++;
            })
        }
        this.sortLanguages();
    }

    /**
     * When a change is made, propagate it through ngModel => returns the only active language tags
     */
    private updateLanguages() {
        //collect the active languages
        let activeLangs: LanguageItem[] = this.getActiveLanguageItems();
        //sort active langs by position
        activeLangs.sort((l1: LanguageItem, l2: LanguageItem) => {
            if (l1.position > l2.position) return 1;
            if (l1.position < l2.position) return -1;
            return 0;
        });

        let renderingLangs: string[] = [];
        activeLangs.forEach(l => {
            renderingLangs.push(l.lang.tag);
        })
        this.propagateChange(renderingLangs);
    }


    changeAllLangStatus(checked: boolean) {
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
        this.updateLanguages();
    }

    private sortLanguages() {
        if (this.sortOrder == SortOrder.POSITION_DESCENDING) {
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
        } else if (this.sortOrder == SortOrder.POSITION_ASCENDING) {
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
        } else if (this.sortOrder == SortOrder.ISO_CODE_DESCENDING) {
            this.renderingLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return -l1.lang.tag.localeCompare(l2.lang.tag);
            });
        } else if (this.sortOrder == SortOrder.ISO_CODE_ASCENDING) {
            this.renderingLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return l1.lang.tag.localeCompare(l2.lang.tag);
            });
        } else if (this.sortOrder == SortOrder.LANGUAGE_DESCENDING) {
            this.renderingLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return -l1.lang.name.localeCompare(l2.lang.name);
            });
        } else if (this.sortOrder == SortOrder.LANGUAGE_ASCENDING) {
            this.renderingLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return l1.lang.name.localeCompare(l2.lang.name);
            });
        }
    }

    changePositionOrder() {
        if (this.sortOrder == SortOrder.POSITION_ASCENDING) {
            this.sortOrder = SortOrder.POSITION_DESCENDING;
        } else { //in case is positionDescending or any other order active
            this.sortOrder = SortOrder.POSITION_ASCENDING;
        }
        this.sortLanguages();
    }
    changeIsocodeOrder() {
        if (this.sortOrder == SortOrder.ISO_CODE_ASCENDING) {
            this.sortOrder = SortOrder.ISO_CODE_DESCENDING;
        } else { //in case is isocodeDescending or any other order active
            this.sortOrder = SortOrder.ISO_CODE_ASCENDING;
        }
        this.sortLanguages();
    }
    changeLanguageOrder() {
        if (this.sortOrder == SortOrder.LANGUAGE_ASCENDING) {
            this.sortOrder = SortOrder.LANGUAGE_DESCENDING;
        } else { //in case is positionDescending or any other order active
            this.sortOrder = SortOrder.LANGUAGE_ASCENDING;
        }
        this.sortLanguages();
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
        this.updateLanguages();
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
        this.updateLanguages();
    }

    //Utils 

    getActiveLanguageItems(): LanguageItem[] {
        let activeLangs: LanguageItem[] = [];
        if (this.renderingLanguages != null) {
            activeLangs = this.renderingLanguages.filter(l => l.active);
        }
        return activeLangs;
    }

    private countActiveLangs(): number {
        return this.getActiveLanguageItems().length;
    }



    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(languages: string[]) {
        //init the language items
        this.initLanguageItems(languages);
    }
    /**
     * Set the function to be called when the control receives a change event.
     */
    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }
    /**
     * Set the function to be called when the control receives a touch event. Not used.
     */
    registerOnTouched(fn: any): void { }

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: any) => { };

    //--------------------------------------------------

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