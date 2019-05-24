import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';

@Component({
    selector: "data-graph-settings-modal",
    templateUrl: "./data-graph-settings-modal.html",
})
export class DataGraphSettingsModal {

    hideLiteralNodes: boolean;

    constructor(public activeModal: NgbActiveModal, private pmkiProp: PMKIProperties) { }

    ngOnInit() {
        this.hideLiteralNodes = this.pmkiProp.getHideLiteralGraphNodes();
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