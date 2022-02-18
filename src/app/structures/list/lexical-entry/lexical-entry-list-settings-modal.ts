import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LexEntryVisualizationMode, LexicalEntryListPreference, VisualizationModeTranslation } from 'src/app/models/Properties';
import { SVContext } from 'src/app/utils/SVContext';
import { SVProperties } from 'src/app/utils/SVProperties';

@Component({
    selector: 'lexical-entry-list-settings-modal',
    templateUrl: './lexical-entry-list-settings-modal.html'
})
export class LexicalEntryListSettingsModal implements OnInit {

    private pristineLexEntryPref: LexicalEntryListPreference;

    visualization: LexEntryVisualizationMode;
    visualizationModes: { value: LexEntryVisualizationMode, labelTranslationKey: string }[] = [
        { value: LexEntryVisualizationMode.indexBased, labelTranslationKey: VisualizationModeTranslation.translationMap[LexEntryVisualizationMode.indexBased] },
        { value: LexEntryVisualizationMode.searchBased, labelTranslationKey: VisualizationModeTranslation.translationMap[LexEntryVisualizationMode.searchBased] }
    ]
    allowVisualizationChange: boolean;

    private safeToGoLimit: number;

    private indexLenght: number;
    lenghtChoices: number[] = [1, 2];
    allowIndexLengthChange: boolean;

    constructor(public activeModal: NgbActiveModal, private svProp: SVProperties) {}

    ngOnInit() {
        let lexEntryPref: LexicalEntryListPreference = SVContext.getProjectCtx().getProjectPreferences().lexEntryListPreferences;
        this.pristineLexEntryPref = JSON.parse(JSON.stringify(lexEntryPref));
        this.visualization = lexEntryPref.visualization;
        this.indexLenght = lexEntryPref.indexLength;
        this.safeToGoLimit = lexEntryPref.safeToGoLimit;

        this.allowVisualizationChange = lexEntryPref.allowVisualizationChange || SVContext.getLoggedUser().isSuperUser(false);
        this.allowIndexLengthChange = lexEntryPref.allowIndexLengthChange || SVContext.getLoggedUser().isSuperUser(false);
    }

    ok() {
        if (this.pristineLexEntryPref.visualization != this.visualization) {
            this.svProp.setLexicalEntryListVisualization(this.visualization);
        }
        if (this.visualization == LexEntryVisualizationMode.indexBased) {
            if (this.pristineLexEntryPref.safeToGoLimit != this.safeToGoLimit) {
                this.svProp.setLexicalEntryListSafeToGoLimit(this.safeToGoLimit);
            }
            if (this.pristineLexEntryPref.indexLength != this.indexLenght) {
                this.svProp.setLexicalEntryListIndexLenght(this.indexLenght);
            }
        }
        this.activeModal.close();
    }

    close() {
        this.activeModal.dismiss();
    }

}
