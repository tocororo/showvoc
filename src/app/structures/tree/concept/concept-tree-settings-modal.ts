import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConceptTreePreference, ConceptTreeVisualizationMode } from 'src/app/models/Properties';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';

@Component({
	selector: 'concept-tree-settings-modal',
	templateUrl: './concept-tree-settings-modal.html'
})
export class ConceptTreeSettingsModal implements OnInit {

	private pristineConcPref: ConceptTreePreference;

    private visualization: ConceptTreeVisualizationMode;
    private visualizationModes: { label: string, value: ConceptTreeVisualizationMode }[] = [
        { label: "Hierarchy based", value: ConceptTreeVisualizationMode.hierarchyBased },
        { label: "Search based", value: ConceptTreeVisualizationMode.searchBased }
    ]

    constructor(public activeModal: NgbActiveModal, private pmkiProp: PMKIProperties) {
    }

    ngOnInit() {
        let conceptTreePref: ConceptTreePreference = this.pmkiProp.getConceptTreePreferences();
        this.pristineConcPref = JSON.parse(JSON.stringify(conceptTreePref));
        
        this.visualization = conceptTreePref.visualization;
    }

	ok() {
        if (this.pristineConcPref.visualization != this.visualization) {
            this.pmkiProp.setConceptTreeVisualization(this.visualization);
        }
		this.activeModal.close();
	}

	close() {
		this.activeModal.dismiss();
	}

}
