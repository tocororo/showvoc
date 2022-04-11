import { Component } from "@angular/core";
import { Language } from 'src/app/models/LanguagesCountries';
import { SVContext } from 'src/app/utils/SVContext';
import { SVProperties } from 'src/app/utils/SVProperties';


@Component({
    selector: "lang-value-filter-pref",
    templateUrl: "./language-value-filter.component.html"
})
export class LanguageValueFilterComponent {

    sortOrder: SortOrder = SortOrder.ISO_CODE_ASCENDING;

    filterLanguages: LanguageItem[] = [];
    filterEnabled: boolean = false;

    constructor(private svProp: SVProperties) { }

    ngOnInit() {
        let projectLanguages: Language[] = SVContext.getProjectCtx().getProjectSettings().projectLanguagesSetting;

        let preferenceLangs: string[] = SVContext.getProjectCtx().getProjectPreferences().filterValueLang.languages;

        if (preferenceLangs.length == 1 && preferenceLangs[0] == "*") { //"*" stands for all languages
            //set as active all the available langs
            for (let i = 0; i < projectLanguages.length; i++) {
                this.filterLanguages.push({
                    lang: projectLanguages[i],
                    active: false
                });
            }
        } else {
            //set as active only the listed by the preference
            for (let i = 0; i < projectLanguages.length; i++) {
                this.filterLanguages.push({
                    lang: projectLanguages[i],
                    active: (preferenceLangs.indexOf(projectLanguages[i].tag) != -1) //active if the language is among the listed in preferences
                });
            }
        }

        this.filterEnabled = SVContext.getProjectCtx().getProjectPreferences().filterValueLang.enabled;
    }

    toggleFilter() {
        this.filterEnabled = !this.filterEnabled;
        this.updatePref();
    }

    changeAllLangStatus(checked: boolean) {
        this.filterLanguages.forEach(l => {
            l.active = checked;
        });
        this.updatePref();
    }

    private updatePref() {
        //collect the active languages to set in the preference
        let preferenceLangs: string[] = [];
        let activeLangs: LanguageItem[] = this.getActiveLanguageItems();
        activeLangs.forEach(l => {
            preferenceLangs.push(l.lang.tag);
        });
        this.svProp.setValueFilterLanguages({ languages: preferenceLangs, enabled: this.filterEnabled });
    }

    changeIsocodeOrder() {
        if (this.sortOrder == SortOrder.ISO_CODE_ASCENDING) {
            this.sortOrder = SortOrder.ISO_CODE_DESCENDING;
            this.filterLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return -l1.lang.tag.localeCompare(l2.lang.tag);
            });
        } else { //in case is isocodeDescending or any other order active
            this.sortOrder = SortOrder.ISO_CODE_ASCENDING;
            this.filterLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return l1.lang.tag.localeCompare(l2.lang.tag);
            });
        }
    }
    changeLanguageOrder() {
        if (this.sortOrder == SortOrder.LANGUAGE_ASCENDING) {
            this.sortOrder = SortOrder.LANGUAGE_DESCENDING;
            this.filterLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return -l1.lang.name.localeCompare(l2.lang.name);
            });
        } else { //in case is positionDescending or any other order active
            this.sortOrder = SortOrder.LANGUAGE_ASCENDING;
            this.filterLanguages.sort((l1: LanguageItem, l2: LanguageItem) => {
                return l1.lang.name.localeCompare(l2.lang.name);
            });
        }
    }

    private onActiveChange(langItem: LanguageItem) {
        this.updatePref();
    }

    //Utils 

    getActiveLanguageItems(): LanguageItem[] {
        let activeLangs: LanguageItem[] = [];
        for (let i = 0; i < this.filterLanguages.length; i++) {
            if (this.filterLanguages[i].active) {
                activeLangs.push(this.filterLanguages[i]);
            }
        }
        return activeLangs;
    }

}

/**
 * Support class that represent a list item of the languages preference
 */
class LanguageItem {
    public lang: Language;
    public active: boolean;
}

class SortOrder {
    public static POSITION_DESCENDING: string = "position_descending";
    public static POSITION_ASCENDING: string = "position_ascending";
    public static ISO_CODE_DESCENDING: string = "isocode_descending";
    public static ISO_CODE_ASCENDING: string = "isocode_ascending";
    public static LANGUAGE_DESCENDING: string = "language_descending";
    public static LANGUAGE_ASCENDING: string = "language_ascending";
}