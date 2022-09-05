import { Component, Input, SimpleChange } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { LanguageUtils } from 'src/app/models/LanguagesCountries';
import { DatasetMetadata2 } from 'src/app/models/Metadata';
import { Literal } from 'src/app/models/Resources';

@Component({
    selector: "dataset-resource",
    templateUrl: "./dataset-resource.component.html",
    styles: [`
    :host {
        min-height: 16px;
        display: inline-flex;
        align-items: center;
    }
    .dataset-nature-icon {
        display: inline-block;
        width: 20px;
    }
    `]
})
export class DatasetResourceComponent {

    @Input() dataset: DatasetMetadata2;

    title: Literal;

    constructor(private translate: TranslateService) {}

    ngOnChanges(changes: SimpleChange) {
        this.title = LanguageUtils.getLocalizedLiteral(this.dataset.titles, this.translate.currentLang);
    }

}
