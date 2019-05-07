import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LexEntryVisualizationMode, LexicalEntryListPreference } from 'src/app/models/Properties';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';

@Component({
	selector: 'lexical-entry-list-settings-modal',
	templateUrl: './lexical-entry-list-settings-modal.html'
})
export class LexicalEntryListSettingsModal implements OnInit {

	private pristineLexEntryPref: LexicalEntryListPreference;

    private visualization: LexEntryVisualizationMode;
    private visualizationModes: { label: string, value: LexEntryVisualizationMode }[] = [
        { label: "Index based", value: LexEntryVisualizationMode.indexBased },
        { label: "Search based", value: LexEntryVisualizationMode.searchBased }
    ]

    private indexLenght: number;
    private lenghtChoices: number[] = [1, 2];

    constructor(public activeModal: NgbActiveModal, private pmkiProp: PMKIProperties) {
    }

    ngOnInit() {
        let lexEntryPref: LexicalEntryListPreference = this.pmkiProp.getLexicalEntryListPreferences();
        this.pristineLexEntryPref = JSON.parse(JSON.stringify(lexEntryPref));
        this.visualization = lexEntryPref.visualization;
        this.indexLenght = lexEntryPref.indexLength;
    }

	ok() {
        if (this.pristineLexEntryPref.visualization != this.visualization) {
            this.pmkiProp.setLexicalEntryListVisualization(this.visualization);
        }
        if (this.visualization == LexEntryVisualizationMode.indexBased && this.pristineLexEntryPref.indexLength != this.indexLenght) {
            this.pmkiProp.setLexicalEntryListIndexLenght(this.indexLenght);
        }
		this.activeModal.close();
	}

	close() {
		this.activeModal.dismiss();
	}

}
