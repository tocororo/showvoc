import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PreferencesSettingsServices } from 'src/app/services/preferences-settings.service';
import { Properties } from 'src/app/models/Properties';
import { RemoteRepositoryAccessConfig } from 'src/app/models/Project';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';

@Component({
    selector: "remote-access-config-modal",
    templateUrl: "./remote-access-config-modal.html",
})
export class RemoteAccessConfigModal {

    savedConfigs: RemoteRepositoryAccessConfig[] = [];
    selectedConfig: RemoteRepositoryAccessConfig;

    newConfig: RemoteRepositoryAccessConfig = { serverURL: null, username: null, password: null };


    constructor(public activeModal: NgbActiveModal, private prefService: PreferencesSettingsServices, private basicModals: BasicModalsServices) { }

    ngOnInit() {
        this.prefService.getSystemSettings([Properties.setting_remote_configs]).subscribe(
            stResp => {
                if (stResp[Properties.setting_remote_configs] != null) {
                    this.savedConfigs = <RemoteRepositoryAccessConfig[]> JSON.parse(stResp[Properties.setting_remote_configs]);
                }
            }
        );
    }

    private selectConfig(c: RemoteRepositoryAccessConfig) {
        if (this.selectedConfig == c) {
            this.selectedConfig = null;
        } else {
            this.selectedConfig = c;
        }
    }

    createConfiguration() {
        //add the new configuration only if another config with the same url doesn't exist
        for (var i = 0; i < this.savedConfigs.length; i++) {
            if (this.savedConfigs[i].serverURL == this.newConfig.serverURL) {
                this.basicModals.alert("Duplicate configuration", "A configuration for the serverURL '" + this.newConfig.serverURL 
                    + "' already exists", ModalType.error);
                return;
            }
        }
        this.savedConfigs.push(this.newConfig);
        this.updateConfigurations();
        this.newConfig = { serverURL: null, username: null, password: null }; //reset config
    }

    private deleteConfig(c: RemoteRepositoryAccessConfig) {
        this.savedConfigs.splice(this.savedConfigs.indexOf(c), 1);
        if (this.selectedConfig == c) {
            this.selectedConfig = null;
        }
        this.updateConfigurations();
    }
    private updateConfServerURL(conf: RemoteRepositoryAccessConfig, newValue: string) {
        conf.serverURL = newValue;
        this.updateConfigurations();
    }
    private updateConfUsername(conf: RemoteRepositoryAccessConfig, newValue: string) {
        conf.username = newValue;
        this.updateConfigurations();
    }
    private updateConfPassword(conf: RemoteRepositoryAccessConfig, newValue: string) {
        conf.password = newValue;
        this.updateConfigurations();
    }
    private updateConfigurations() {
        let conf: string;
        if (this.savedConfigs.length == 0) {
            conf = null;
        } else {
            conf = JSON.stringify(this.savedConfigs);
        }
        this.prefService.setSystemSetting(Properties.setting_remote_configs, conf).subscribe();
    }

    ok() {
        this.activeModal.close(this.selectedConfig);
    }

    close() {
        this.activeModal.dismiss();
    }

}