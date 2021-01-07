import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConceptTreePreference, ConceptTreeVisualizationMode, VisualizationModeTranslation } from 'src/app/models/Properties';
import { PMKIContext } from 'src/app/utils/PMKIContext';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';

@Component({
	selector: 'concept-tree-settings-modal',
	templateUrl: './concept-tree-settings-modal.html'
})
export class ConceptTreeSettingsModal implements OnInit {

	private pristineConcPref: ConceptTreePreference;

    visualization: ConceptTreeVisualizationMode;
    visualizationModes: { value: ConceptTreeVisualizationMode, labelTranslationKey: string }[] = [
        { value: ConceptTreeVisualizationMode.hierarchyBased, labelTranslationKey: VisualizationModeTranslation.translationMap[ConceptTreeVisualizationMode.hierarchyBased] },
        { value: ConceptTreeVisualizationMode.searchBased, labelTranslationKey: VisualizationModeTranslation.translationMap[ConceptTreeVisualizationMode.searchBased] }
    ]
    allowVisualizationChange: boolean;

    private safeToGoLimit: number;

    constructor(public activeModal: NgbActiveModal, private pmkiProp: PMKIProperties) {}

    ngOnInit() {
        let conceptTreePref: ConceptTreePreference = PMKIContext.getProjectCtx().getProjectPreferences().conceptTreePreferences;
        this.allowVisualizationChange = conceptTreePref.allowVisualizationChange || PMKIContext.getLoggedUser().isAdmin();
        this.pristineConcPref = JSON.parse(JSON.stringify(conceptTreePref));
        
        this.visualization = conceptTreePref.visualization;
        this.safeToGoLimit = conceptTreePref.safeToGoLimit;
    }

	ok() {
        if (this.pristineConcPref.visualization != this.visualization) {
            this.pmkiProp.setConceptTreeVisualization(this.visualization);
        }
        if (this.visualization == ConceptTreeVisualizationMode.hierarchyBased) {
            if (this.pristineConcPref.safeToGoLimit != this.safeToGoLimit) {
                this.pmkiProp.setConceptTreeSafeToGoLimit(this.safeToGoLimit);
            }
        }
		this.activeModal.close();
	}

	close() {
		this.activeModal.dismiss();
	}

}
