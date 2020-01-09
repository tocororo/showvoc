import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClassTreePreference } from 'src/app/models/Properties';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { PMKIContext } from 'src/app/utils/PMKIContext';

@Component({
	selector: 'class-tree-settings-modal',
	templateUrl: './class-tree-settings-modal.html'
})
export class ClassTreeSettingsModal implements OnInit {

    private pristinePref: ClassTreePreference;

    showInstances: boolean;

    constructor(public activeModal: NgbActiveModal, private pmkiProp: PMKIProperties) {}

    ngOnInit() {
        let classTreePref: ClassTreePreference = PMKIContext.getProjectCtx().getProjectPreferences().classTreePreferences;
        this.pristinePref = JSON.parse(JSON.stringify(classTreePref));

        this.showInstances = classTreePref.showInstancesNumber;
    }

	ok() {
        if (this.pristinePref.showInstancesNumber != this.showInstances) {
            this.pmkiProp.setClassTreeShowInstances(this.showInstances);
        }
		this.activeModal.close();
	}

	close() {
		this.activeModal.dismiss();
	}

}
