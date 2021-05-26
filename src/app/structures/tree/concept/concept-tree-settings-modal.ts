import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConceptTreePreference, ConceptTreeVisualizationMode, VisualizationModeTranslation } from 'src/app/models/Properties';
import { SVContext } from 'src/app/utils/SVContext';
import { SVProperties } from 'src/app/utils/SVProperties';

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

    constructor(public activeModal: NgbActiveModal, private svProp: SVProperties) {}

    ngOnInit() {
        let conceptTreePref: ConceptTreePreference = SVContext.getProjectCtx().getProjectPreferences().conceptTreePreferences;
        this.allowVisualizationChange = conceptTreePref.allowVisualizationChange || SVContext.getLoggedUser().isAdmin();
        this.pristineConcPref = JSON.parse(JSON.stringify(conceptTreePref));
        
        this.visualization = conceptTreePref.visualization;
        this.safeToGoLimit = conceptTreePref.safeToGoLimit;
    }

	ok() {
        if (this.pristineConcPref.visualization != this.visualization) {
            this.svProp.setConceptTreeVisualization(this.visualization);
        }
        if (this.visualization == ConceptTreeVisualizationMode.hierarchyBased) {
            if (this.pristineConcPref.safeToGoLimit != this.safeToGoLimit) {
                this.svProp.setConceptTreeSafeToGoLimit(this.safeToGoLimit);
            }
        }
		this.activeModal.close();
	}

	close() {
		this.activeModal.dismiss();
	}

}
