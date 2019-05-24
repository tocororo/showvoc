import { Component, Input } from "@angular/core";
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { Language } from "../../models/LanguagesCountries";
import { UIUtils } from "../../utils/UIUtils";

@Component({
    selector: "lang-item",
    templateUrl: "./language-item.component.html"
})
export class LanguageItemComponent {
    @Input() language: Language;
    @Input() showTag: boolean;
    @Input() disabled: boolean;

    constructor(private pmkiProp: PMKIProperties) { }

    getFlagImgSrc(langTag: string): string {
        if (this.pmkiProp.getShowFlags()) {
            return UIUtils.getFlagImgSrc(langTag);
        } else {
            return UIUtils.getFlagImgSrc(null); //null makes return unknown flag => do not show flag
        }
    }
}



