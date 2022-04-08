import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { ExtensionPointID, Scope } from "src/app/models/Plugins";
import { RemoteRepositoryAccessConfig } from 'src/app/models/Project';
import { SettingsEnum } from 'src/app/models/Properties';
import { SettingsServices } from "src/app/services/settings.service";

@Component({
    selector: "remote-access-config-modal",
    templateUrl: "./remote-access-config-modal.html",
})
export class RemoteAccessConfigModal {

    savedConfigs: RemoteRepositoryAccessConfig[] = [];

    newConfig: RemoteRepositoryAccessConfig = { serverURL: null, username: null, password: null };


    constructor(public activeModal: NgbActiveModal, private settingsService: SettingsServices, private basicModals: BasicModalsServices) { }

    ngOnInit() {
        this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM).subscribe(
            settings => {
                let remoteConfSetting: RemoteRepositoryAccessConfig[] = settings.getPropertyValue(SettingsEnum.remoteConfigs);
                if (remoteConfSetting != null) {
                    this.savedConfigs = remoteConfSetting;
                }
            }
        );
    }

    createConfiguration() {
        //add the new configuration only if another config with the same url doesn't exist
        for (let i = 0; i < this.savedConfigs.length; i++) {
            if (this.savedConfigs[i].serverURL == this.newConfig.serverURL) {
                this.basicModals.alert({ key: "COMMONS.CONFIG.DUPLICATED_CONFIGURATION" }, { key: "MESSAGES.DUPLICATED_SERVER_URL_CONFIG" }, ModalType.error);
                return;
            }
        }
        this.savedConfigs.push(this.newConfig);
        this.updateConfigurations();
        this.newConfig = { serverURL: null, username: null, password: null }; //reset config
    }

    private deleteConfig(c: RemoteRepositoryAccessConfig) {
        this.savedConfigs.splice(this.savedConfigs.indexOf(c), 1);
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
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM, SettingsEnum.remoteConfigs, this.savedConfigs).subscribe();
    }

    ok() {
        this.activeModal.close();
    }

    close() {
        this.activeModal.dismiss();
    }

}