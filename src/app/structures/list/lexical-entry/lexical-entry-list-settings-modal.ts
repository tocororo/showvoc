import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LexEntryVisualizationMode, LexicalEntryListPreference } from 'src/app/models/Properties';
import { PMKIContext } from 'src/app/utils/PMKIContext';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';

@Component({
    selector: 'lexical-entry-list-settings-modal',
    templateUrl: './lexical-entry-list-settings-modal.html'
})
export class LexicalEntryListSettingsModal implements OnInit {

    private pristineLexEntryPref: LexicalEntryListPreference;

    visualization: LexEntryVisualizationMode;
    visualizationModes: { label: string, value: LexEntryVisualizationMode }[] = [
        { label: "Index based", value: LexEntryVisualizationMode.indexBased },
        { label: "Search based", value: LexEntryVisualizationMode.searchBased }
    ]

    private safeToGoLimit: number;

    private indexLenght: number;
    private lenghtChoices: number[] = [1, 2];

    constructor(public activeModal: NgbActiveModal, private pmkiProp: PMKIProperties) {}

    ngOnInit() {
        let lexEntryPref: LexicalEntryListPreference = PMKIContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences;
        this.pristineLexEntryPref = JSON.parse(JSON.stringify(lexEntryPref));
        this.visualization = lexEntryPref.visualization;
        this.indexLenght = lexEntryPref.indexLength;
        this.safeToGoLimit = lexEntryPref.safeToGoLimit;
    }

    ok() {
        if (this.pristineLexEntryPref.visualization != this.visualization) {
            this.pmkiProp.setLexicalEntryListVisualization(this.visualization);
        }
        if (this.visualization == LexEntryVisualizationMode.indexBased) {
            if (this.pristineLexEntryPref.safeToGoLimit != this.safeToGoLimit) {
                this.pmkiProp.setLexicalEntryListSafeToGoLimit(this.safeToGoLimit);
            }
            if (this.pristineLexEntryPref.indexLength != this.indexLenght) {
                this.pmkiProp.setLexicalEntryListIndexLenght(this.indexLenght);
            }
        }
        this.activeModal.close();
    }

    close() {
        this.activeModal.dismiss();
    }

}
