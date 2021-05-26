import { Component, Input, SimpleChanges } from "@angular/core";
import { Subscription } from "rxjs";
import { SVEventHandler } from "src/app/utils/SVEventHandler";
import { SVProperties } from "src/app/utils/SVProperties";
import { Language } from "../../models/LanguagesCountries";
import { UIUtils } from "../../utils/UIUtils";

@Component({
    selector: "lang-item",
    templateUrl: "./language-item.component.html",
    styles: [`
        :host { display: inline-block }
        .flag-xs { zoom: 100%; }
        .flag-sm { zoom: 130%; }
        .flag-md { zoom: 150%; }
        .flag-lg { zoom: 170%; }
    `]
})
export class LanguageItemComponent {
    @Input() language: Language;
    @Input() showName: boolean = true; //tells whether to show the language name nearby the flag
    @Input() showTag: boolean; //tells whether to show the language tag nearby the flag
    @Input() disabled: boolean;
    @Input() size: "xs" | "sm" | "md" | "lg";

    flagImgSrc: string;
    flagCls: string;

    eventSubscriptions: Subscription[] = [];

    constructor(private svProp: SVProperties, private eventHandler: SVEventHandler) {
        this.eventSubscriptions.push(this.eventHandler.showFlagChangedEvent.subscribe(
            () => this.initFlagImgSrc()));
    }

    ngOnInit() {
        if (this.size == "sm" || this.size == "md" || this.size == "lg") {
            this.flagCls = "flag-" + this.size;
        } else {
            this.flagCls = "flag-xs";
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        this.initFlagImgSrc();
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach(s => s.unsubscribe);
    }

    private initFlagImgSrc() {
        if (this.language.tag == "--") {
            this.flagImgSrc = "./assets/images/icons/res/string.png";
        } else {
            if (this.svProp.getShowFlags()) {
                this.flagImgSrc = UIUtils.getFlagImgSrc(this.language.tag);
            } else {
                this.flagImgSrc = UIUtils.getFlagImgSrc(null); //null makes return unknown flag => do not show flag
            }
        }
    }

}