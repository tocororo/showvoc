import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SVContext } from "src/app/utils/SVContext";
import { SVProperties } from "src/app/utils/SVProperties";
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

    constructor(public activeModal: NgbActiveModal, private svProp: SVProperties) {}

    ngOnInit() {
        let instanceListPref: InstanceListPreference = SVContext.getProjectCtx().getProjectPreferences().instanceListPreferences;
        this.allowVisualizationChange = instanceListPref.allowVisualizationChange || SVContext.getLoggedUser().isAdmin();
        this.pristineInstancePref = JSON.parse(JSON.stringify(instanceListPref));
        this.visualization = instanceListPref.visualization;
        this.safeToGoLimit = instanceListPref.safeToGoLimit;
    }

    ok() {
        if (this.pristineInstancePref.visualization != this.visualization) {
            this.svProp.setInstanceListVisualization(this.visualization);
        }
        if (this.visualization == InstanceListVisualizationMode.standard) {
            if (this.pristineInstancePref.safeToGoLimit != this.safeToGoLimit) {
                this.svProp.setInstanceLisSafeToGoLimit(this.safeToGoLimit);
            }
        }
        this.activeModal.close();
    }

    cancel() {
        this.activeModal.dismiss();
    }

}