import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Settings } from 'src/app/models/Plugins';

@Component({
	selector: 'plugin-config-modal',
	templateUrl: './plugin-configuration-modal.html'
})
export class PluginConfigurationModal {

    @Input() configuration: Settings;
    config: Settings;

    constructor(public activeModal: NgbActiveModal) {}

    ngOnInit() {
        //copy the context configuration (so changes of params don't affect original configuration params)
        this.config = this.configuration.clone();
    }

    isOkClickable(): boolean {
        return !this.config.requireConfiguration();
    }

    ok() {
		this.activeModal.close(this.config);
	}

	close() {
		this.activeModal.dismiss();
	}
	
}
