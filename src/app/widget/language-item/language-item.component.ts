import { Component, Input } from "@angular/core";
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { Language } from "../../models/LanguagesCountries";
import { UIUtils } from "../../utils/UIUtils";
import { Subscriber, Subscription } from 'rxjs';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';

@Component({
    selector: "lang-item",
    templateUrl: "./language-item.component.html"
})
export class LanguageItemComponent {
    @Input() language: Language;
    @Input() showTag: boolean;
    @Input() disabled: boolean;

    flagImgSrc: string;

    eventSubscriptions: Subscription[] = [];

    constructor(private pmkiProp: PMKIProperties, private eventHandler: PMKIEventHandler) {
        this.eventSubscriptions.push(eventHandler.showFlagChangedEvent.subscribe(
            (showFlag: boolean) => this.initFlagImgSrc()));
    }

    ngOnInit() {
        this.initFlagImgSrc();
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    private initFlagImgSrc() {
        if (this.pmkiProp.getShowFlags()) {
            this.flagImgSrc = UIUtils.getFlagImgSrc(this.language.tag);
        } else {
            this.flagImgSrc = UIUtils.getFlagImgSrc(null); //null makes return unknown flag => do not show flag
        }
    }

}



