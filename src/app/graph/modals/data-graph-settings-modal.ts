import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SVProperties } from 'src/app/utils/SVProperties';
import { SVContext } from 'src/app/utils/SVContext';

@Component({
    selector: "data-graph-settings-modal",
    templateUrl: "./data-graph-settings-modal.html",
})
export class DataGraphSettingsModal {

    hideLiteralNodes: boolean;

    constructor(public activeModal: NgbActiveModal, private svProp: SVProperties) { }

    ngOnInit() {
        this.hideLiteralNodes = SVContext.getProjectCtx().getProjectPreferences().hideLiteralGraphNodes;
    }

    onHideLiteralChange() {
        this.svProp.setHideLiteralGraphNodes(this.hideLiteralNodes);
    }

    ok() {
        this.activeModal.close();
    }

    close() {
        this.activeModal.dismiss();
    }

}