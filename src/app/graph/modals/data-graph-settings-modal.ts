import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { PMKIContext } from 'src/app/utils/PMKIContext';

@Component({
    selector: "data-graph-settings-modal",
    templateUrl: "./data-graph-settings-modal.html",
})
export class DataGraphSettingsModal {

    hideLiteralNodes: boolean;

    constructor(public activeModal: NgbActiveModal, private pmkiProp: PMKIProperties) { }

    ngOnInit() {
        this.hideLiteralNodes = PMKIContext.getProjectCtx().getProjectPreferences().hideLiteralGraphNodes;
    }

    onHideLiteralChange() {
        this.pmkiProp.setHideLiteralGraphNodes(this.hideLiteralNodes);
    }

    ok() {
        this.activeModal.close();
    }

    close() {
        this.activeModal.dismiss();
    }

}