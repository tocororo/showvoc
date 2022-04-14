import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Language } from "src/app/models/LanguagesCountries";
import { SVContext, ProjectContext } from "src/app/utils/SVContext";

@Component({
    selector: "lang-selector-modal",
    templateUrl: "./languages-selector-modal.html",
})
export class LanguageSelectorModal {
    @Input() title: string;
    @Input() languages: string[] = [];
    @Input() radio: boolean;
    @Input() projectAware: boolean;
    @Input() projectCtx: ProjectContext;

    languageItems: LanguageItem[];

    constructor(public activeModal: NgbActiveModal) {}

    ngOnInit() {
        let languages: Language[];
        this.languageItems = [];
        if (this.projectAware) {
            languages = SVContext.getProjectCtx(this.projectCtx).getProjectSettings().projectLanguagesSetting;
        } else {
            languages = SVContext.getSystemSettings().languages;
        }

        let initiallySelectedLanguages = this.languages;
        if (this.radio && initiallySelectedLanguages.length > 1) {
            initiallySelectedLanguages = initiallySelectedLanguages.slice(0, 1); // in case of radio behavior, only consider the first selected language
        }

        for (let i = 0; i < languages.length; i++) {
            this.languageItems.push({
                lang: languages[i], 
                selected: initiallySelectedLanguages.indexOf(languages[i].tag) != -1
            });
        }
    }

    selectLang(lang: LanguageItem) {
        if (this.radio) {
            this.languageItems.forEach(l => {
                if (l == lang) {
                    l.selected = true;
                } else {
                    l.selected = false;
                }
            });
        } else {
            lang.selected = !lang.selected;
        }
    }

    okDisabled(): boolean {
        return this.radio && !this.languageItems.some(l => l.selected);
    }

    ok() {
        let activeLangs: string[] = [];
        for (let i = 0; i < this.languageItems.length; i++) {
            if (this.languageItems[i].selected) {
                activeLangs.push(this.languageItems[i].lang.tag);
            }
        }
        this.activeModal.close(activeLangs);
    }

    close() {
        this.activeModal.dismiss();
    }

}

class LanguageItem {
    public lang: Language;
    public selected: boolean;
}