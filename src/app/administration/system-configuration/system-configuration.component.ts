import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { ExtensionPointID, Scope, Settings, STProperties } from 'src/app/models/Plugins';
import { RemoteRepositoryAccessConfig } from 'src/app/models/Project';
import { PmkiSettings, SettingsEnum, VocBenchConnectionPmkiSettings } from 'src/app/models/Properties';
import { AdministrationServices } from 'src/app/services/administration.service';
import { PmkiServices } from 'src/app/services/pmki.service';
import { SettingsServices } from 'src/app/services/settings.service';
import { PMKIContext } from 'src/app/utils/PMKIContext';

@Component({
    selector: 'system-config',
    templateUrl: './system-configuration.component.html',
    host: { class: "vbox" }
})
export class SystemConfigurationComponent implements OnInit {

    private getSystemCoreSettingsFn: Observable<Settings> = this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM);

    /* ST+VB configuration */
    private pmkiSettings: PmkiSettings;
    vbConnectionConfig: VocBenchConnectionPmkiSettings = new VocBenchConnectionPmkiSettings();
    private pristineVbConnConfig: VocBenchConnectionPmkiSettings;
    
    testVbConfigLoading: boolean;

    /* Remote access configuration */

    private remoteConfigsSetting: RemoteRepositoryAccessConfig[]; //on ST remote config is a list, here in PMKI it is shown just the first
    remoteAccessConfig: RemoteRepositoryAccessConfig = { serverURL: null, username: null, password: null };
    private pristineRemoteAccessConf: RemoteRepositoryAccessConfig;

    /* E-mail configuration */

    emailSettings: MailSettings;
    private emailSettingsPristine: MailSettings;
    cryptoProtocol: string;

    testEmailConfigLoading: boolean;

    closedAlert1: boolean;
    closedAlert2: boolean;
    closedAlert3: boolean;

    
    constructor(private adminService: AdministrationServices, private pmkiService: PmkiServices, private settingsService: SettingsServices,
        private basicModals: BasicModalsServices) { }

    ngOnInit() {
        this.initAll()
    }

    private initAll() {
        this.getSystemCoreSettingsFn.subscribe(
            settings => {
                this.initEmailConfigHanlder(settings);
                this.initRemoteConfigHandler(settings);
                this.initVbConfigHandler(settings);
            }
        )
    }

    /* ============================
     * E-mail managment
     * ============================ */

    private initEmailConfig() {
        this.getSystemCoreSettingsFn.subscribe(
            settings => {
                this.initEmailConfigHanlder(settings);
            }
        )
    }

    private initEmailConfigHanlder(settings: Settings) {
        let mailProp: STProperties = settings.getProperty(SettingsEnum.mail);
        let mailPropCloned = mailProp.clone();
        this.emailSettings = mailProp.value;
        this.emailSettingsPristine = mailPropCloned.value;

        this.cryptoProtocol = "None";
        if (this.emailSettings.smtp.sslEnabled) {
            this.cryptoProtocol = "SSL";
        } else if (this.emailSettings.smtp.starttlsEnabled) {
            this.cryptoProtocol = "TLS";
        }
    }

    updateProtocol() {
        if (this.cryptoProtocol == "SSL") {
            this.emailSettings.smtp.sslEnabled = true;
            this.emailSettings.smtp.starttlsEnabled = false;
        } else if (this.cryptoProtocol == "TLS") {
            this.emailSettings.smtp.sslEnabled = false;
            this.emailSettings.smtp.starttlsEnabled = true;
        } else {
            this.emailSettings.smtp.sslEnabled = false;
            this.emailSettings.smtp.starttlsEnabled = false;
        }
    }
    
    updateEmailConfig() {
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM, SettingsEnum.mail, this.emailSettings).subscribe(
            () => {
                this.initEmailConfig();
            }
        )
    }

    testEmailConfig() {
        if (this.isEmailConfigChanged()) {
            this.basicModals.alert({ key: "ADMINISTRATION.SYSTEM.EMAIL.EMAIL_CONFIG_TEST" }, {key:"MESSAGES.EMAIL_CONFIG_CHANGED"}, ModalType.warning);
            return;
        }

        this.basicModals.prompt({ key: "ADMINISTRATION.SYSTEM.EMAIL.EMAIL_CONFIG_TEST" }, { value: "Mail to" }, { key: "MESSAGES.EMAIL_CONFIG_TEST_INFO"}, 
            PMKIContext.getLoggedUser().getEmail()).then(
            mailTo => {
                this.testEmailConfigLoading = true;
                this.adminService.testEmailConfig(mailTo).pipe(
                    finalize(() => this.testEmailConfigLoading = false)
                ).subscribe(
                    () => {
                        this.basicModals.alert({ key: "ADMINISTRATION.SYSTEM.EMAIL.EMAIL_CONFIG_TEST" }, {key:"MESSAGES.EMAIL_CONFIG_TEST_SUCCESS"});
                    }
                );
            },
            () => {}
        );
    }

    isEmailConfigChanged(): boolean {
        return JSON.stringify(this.emailSettingsPristine) != JSON.stringify(this.emailSettings);
    }

    /* ============================
     * Remote access config managment
     * ============================ */

    private initRemoteConfig() {
        this.getSystemCoreSettingsFn.subscribe(
            settings => {
                this.initRemoteConfigHandler(settings);
            }
        )
    }

    private initRemoteConfigHandler(settings: Settings) {
        this.remoteConfigsSetting = settings.getPropertyValue(SettingsEnum.remoteConfigs);
        if (this.remoteConfigsSetting == null || this.remoteConfigsSetting.length == 0) {
            this.remoteConfigsSetting = [this.remoteAccessConfig];
        }
        this.remoteAccessConfig = this.remoteConfigsSetting[0];
        this.pristineRemoteAccessConf = Object.assign({}, this.remoteAccessConfig);
    }

    updateRemoteConfig() {
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM, SettingsEnum.remoteConfigs, this.remoteConfigsSetting).subscribe(
            () => {
                this.initRemoteConfig();
            }
        );
    }

    isRemoteConfigChanged() {
        for (let key in this.pristineRemoteAccessConf) {
            if (this.pristineRemoteAccessConf[key] != this.remoteAccessConfig[key]) {
                return true;
            }
        }
        return false;
    }

    /* ============================
     * VB config managment
     * ============================ */

    private initVbConfig() {
        this.getSystemCoreSettingsFn.subscribe(
            settings => {
                this.initVbConfigHandler(settings);
            }
        )
    }

    private initVbConfigHandler(settings: Settings) {
        this.pmkiSettings = settings.getPropertyValue(SettingsEnum.pmki);
        if (this.pmkiSettings != null && this.pmkiSettings.vbConnectionConfig != null) {
            this.vbConnectionConfig = this.pmkiSettings.vbConnectionConfig
        } else {
            this.vbConnectionConfig;
        }
        this.pristineVbConnConfig = Object.assign({}, this.vbConnectionConfig);
    }

    updateVbConfig() {
        this.pmkiSettings.vbConnectionConfig = this.vbConnectionConfig;
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM, SettingsEnum.pmki, this.pmkiSettings).subscribe(
            () =>{
                this.initVbConfig();
            }
        );
    }

    testVbConnection() {
        if (
            (!this.vbConnectionConfig.adminEmail || this.vbConnectionConfig.adminEmail.trim() == "") ||
            (!this.vbConnectionConfig.adminPassword || this.vbConnectionConfig.adminPassword.trim() == "") ||
            (!this.vbConnectionConfig.stHost || this.vbConnectionConfig.stHost.trim() == "")
        ) {
            this.basicModals.alert({ key: "ADMINISTRATION.SYSTEM.VB_CONFIG.VB_CONFIG_TEST" }, {key:"MESSAGES.VB_CONFIG_INCOMPLETE"}, ModalType.warning);
            return;
        }
        if (this.isVbConfigChanged()) {
            this.basicModals.alert({ key: "ADMINISTRATION.SYSTEM.VB_CONFIG.VB_CONFIG_TEST" }, {key:"MESSAGES.VB_CONFIG_CHANGED"}, ModalType.warning);
            return;
        }
        this.testVbConfigLoading = true;
        this.pmkiService.testVocbenchConfiguration().pipe(
            finalize(() => this.testVbConfigLoading = false)
        ).subscribe(
            () => {
                this.basicModals.alert({ key: "ADMINISTRATION.SYSTEM.VB_CONFIG.VB_CONFIG_TEST" }, {key:"MESSAGES.VB_CONFIG_TEST_SUCCESS"});
            },
            (error: Error) => {
                this.basicModals.alert({ key: "ADMINISTRATION.SYSTEM.VB_CONFIG.VB_CONFIG_TEST" }, {key:"MESSAGES.VB_CONFIG_TEST_FAIL"}, ModalType.error, error.message);
            }
        )
    }

    isVbConfigChanged() {
        for (var key in this.pristineVbConnConfig) {
            if (this.pristineVbConnConfig[key] != this.vbConnectionConfig[key]) {
                return true;
            }
        }
        return false;
    }

}

class MailSettings {
    smtp: {
        auth: boolean,
        host: string,
        port: number,
        sslEnabled: boolean,
        starttlsEnabled: boolean
    };
    from: {
        address: string,
        password: string,
        alias: string,
    }
}