import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: "res-view-settings-modal",
    templateUrl: "./resource-view-settings-modal.html",
})
export class ResViewSettingsModal {

    constructor(public activeModal: NgbActiveModal) { }

    ok() {
        this.activeModal.close();
    }

    close() {
        this.activeModal.dismiss();
    }

}