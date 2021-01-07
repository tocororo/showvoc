import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PMKIContext } from "src/app/utils/PMKIContext";
import { PMKIProperties } from "src/app/utils/PMKIProperties";
import { InstanceListPreference, InstanceListVisualizationMode, VisualizationModeTranslation } from "../../../models/Properties";

@Component({
    selector: "instance-list-settings-modal",
    templateUrl: "./instance-list-settings-modal.html",
})
export class InstanceListSettingsModal {

    private pristineInstancePref: InstanceListPreference;

    visualization: InstanceListVisualizationMode;
    visualizationModes: { value: InstanceListVisualizationMode, labelTranslationKey: string }[] = [
        { value: InstanceListVisualizationMode.standard, labelTranslationKey: VisualizationModeTranslation.translationMap[InstanceListVisualizationMode.standard] },
        { value: InstanceListVisualizationMode.searchBased, labelTranslationKey: VisualizationModeTranslation.translationMap[InstanceListVisualizationMode.searchBased] }
    ]
    allowVisualizationChange: boolean;

    private safeToGoLimit: number;

    constructor(public activeModal: NgbActiveModal, private pmkiProp: PMKIProperties) {}

    ngOnInit() {
        let instanceListPref: InstanceListPreference = PMKIContext.getProjectCtx().getProjectPreferences().instanceListPreferences;
        this.allowVisualizationChange = instanceListPref.allowVisualizationChange || PMKIContext.getLoggedUser().isAdmin();
        this.pristineInstancePref = JSON.parse(JSON.stringify(instanceListPref));
        this.visualization = instanceListPref.visualization;
        this.safeToGoLimit = instanceListPref.safeToGoLimit;
    }

    ok() {
        if (this.pristineInstancePref.visualization != this.visualization) {
            this.pmkiProp.setInstanceListVisualization(this.visualization);
        }
        if (this.visualization == InstanceListVisualizationMode.standard) {
            if (this.pristineInstancePref.safeToGoLimit != this.safeToGoLimit) {
                this.pmkiProp.setInstanceLisSafeToGoLimit(this.safeToGoLimit);
            }
        }
        this.activeModal.close();
    }

    cancel() {
        this.activeModal.dismiss();
    }

}