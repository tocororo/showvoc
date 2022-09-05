import { Component, Input, SimpleChanges } from "@angular/core";
import { Subscription } from "rxjs";
import { SVEventHandler } from "src/app/utils/SVEventHandler";
import { SVProperties } from "src/app/utils/SVProperties";
import { Language, Languages } from "../../models/LanguagesCountries";
import { UIUtils } from "../../utils/UIUtils";

@Component({
    selector: "lang-item",
    templateUrl: "./language-item.component.html",
    styleUrls: ["./language-item.component.css"]
})
export class LanguageItemComponent {
    @Input() language: Language;
    @Input() showName: boolean = true; //tells whether to show the language name nearby the flag
    @Input() showTag: boolean; //tells whether to show the language tag nearby the flag
    @Input() disabled: boolean;
    @Input() size: "xs" | "sm" | "md" | "lg";

    flagImgSrc: string;
    flagCls: string;

    langTagWidth: number; //compute dynamically the width of the flag in case of no-flag available (or don't diplay flag option)

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
        this.eventSubscriptions.forEach(s => s.unsubscribe());
    }

    private initFlagImgSrc() {
        if (this.language.tag == Languages.NO_LANG.tag) {
            this.flagImgSrc = "./assets/images/icons/res/string.png";
        } else {
            if (this.svProp.getShowFlags()) {
                this.flagImgSrc = UIUtils.getFlagImgSrc(this.language.tag);
            } else {
                this.flagImgSrc = UIUtils.getFlagImgSrc(null); //null makes return unknown flag => do not show flag
            }
        }
        this.langTagWidth = this.language.tag ? ((this.language.tag.length * 6) + 2) : 0; //6px for each char + 2px of padding
    }

}