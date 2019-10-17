import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { RemoteRepositoryAccessConfig } from 'src/app/models/Project';
import { Properties } from 'src/app/models/Properties';
import { AdministrationServices } from 'src/app/services/administration.service';
import { PmkiServices } from 'src/app/services/pmki.service';
import { PreferencesSettingsServices } from 'src/app/services/preferences-settings.service';
import { PMKIContext } from 'src/app/utils/PMKIContext';

@Component({
    selector: 'system-config',
    templateUrl: './system-configuration.component.html',
    host: { class: "pageComponent" }
})
export class SystemConfigurationComponent implements OnInit {

    /* ST+VB configuration */
    vbConnectionConfig: VbConnectionConfig = {
        vbUrl: null,
        stHost: null,
        adminEmail: null,
        adminPassword: ""
    }
    private pristineVbConnConfig: VbConnectionConfig;
    
    testVbConfigLoading: boolean;

    /* Remote access configuration */

    remoteAccessConfig: RemoteRepositoryAccessConfig = { serverURL: null, username: null, password: null };
    private pristineRemoteAccessConf: RemoteRepositoryAccessConfig;

    /* E-mail configuration */

    emailConfig: EmailConfig = {
        mailFromAddress: null,
        mailFromPassword: null,
        mailFromAlias: null,
        mailSmtpHost: null,
        mailSmtpPort: null,
        mailSmtpAuth: null,
        mailSmtpSslEnable: false,
        mailSmtpStarttlsEnable: false
    };
    private pristineEmailConfig: EmailConfig;
    cryptoProtocol: string;

    testEmailConfigLoading: boolean;

    
    constructor(private adminService: AdministrationServices, private pmkiService: PmkiServices, private preferenceService: PreferencesSettingsServices,
        private basicModals: BasicModalsServices) { }

    ngOnInit() {
        this.initEmailConfig();
        this.initRemoteConfig();
        this.initVbConfig();
    }

    /* ============================
     * E-mail managment
     * ============================ */

    private initEmailConfig() {
        this.adminService.getAdministrationConfig().subscribe(
            conf => {
                this.emailConfig = {
                    mailFromAddress: conf.mailFromAddress,
                    mailFromPassword: conf.mailFromPassword,
                    mailFromAlias: conf.mailFromAlias,
                    mailSmtpHost: conf.mailSmtpHost,
                    mailSmtpPort: conf.mailSmtpPort,
                    mailSmtpAuth: conf.mailSmtpAuth,
                    mailSmtpSslEnable: conf.mailSmtpSslEnable == "true",
                    mailSmtpStarttlsEnable: conf.mailSmtpStarttlsEnable == "true"
                }
                this.pristineEmailConfig = Object.assign({}, this.emailConfig);

                //init cryptoProtocol
                this.cryptoProtocol = "None";
                if (this.emailConfig.mailSmtpSslEnable) {
                    this.cryptoProtocol = "SSL";
                } else if (this.emailConfig.mailSmtpStarttlsEnable) {
                    this.cryptoProtocol = "TLS";
                }
            }
        );
    }

    updateProtocol() {
        if (this.cryptoProtocol == "SSL") {
            this.emailConfig.mailSmtpSslEnable = true;
            this.emailConfig.mailSmtpStarttlsEnable = false;
        } else if (this.cryptoProtocol == "TLS") {
            this.emailConfig.mailSmtpSslEnable = false;
            this.emailConfig.mailSmtpStarttlsEnable = true;
        } else {
            this.emailConfig.mailSmtpSslEnable = false;
            this.emailConfig.mailSmtpStarttlsEnable = false;
        }
    }
    
    updateEmailConfig() {
        let mailFromPwd: string = null;
        if (this.emailConfig.mailSmtpAuth) {
            mailFromPwd = this.emailConfig.mailFromPassword;
        }
        this.adminService.updateEmailConfig(this.emailConfig.mailSmtpHost, this.emailConfig.mailSmtpPort, this.emailConfig.mailSmtpAuth, 
            this.emailConfig.mailSmtpSslEnable, this.emailConfig.mailSmtpStarttlsEnable,
            this.emailConfig.mailFromAddress, this.emailConfig.mailFromAlias, mailFromPwd).subscribe(
            () => {
                this.initEmailConfig();
            }
        )
    }

    testEmailConfig() {
        if (this.isEmailConfigChanged()) {
            this.basicModals.alert("Email configuration test", "Email configuration has been changed, you need first to submit the changes.", ModalType.warning);
            return;
        }

        this.basicModals.prompt("Email configuration test", { value: "Mail to" }, "This test will send an e-mail to the provided address in order to "
            + "check the e-mail configuration", PMKIContext.getLoggedUser().getEmail()).then(
            mailTo => {
                this.testEmailConfigLoading = true;
                this.pmkiService.testEmailConfig(mailTo).pipe(
                    finalize(() => this.testEmailConfigLoading = false)
                ).subscribe(
                    () => {
                        this.basicModals.alert("Email configuration test", "The configuration works fine. A test e-mail has been sent to " + mailTo + ".");
                    }
                );
            },
            () => {}
        );
    }

    isEmailConfigChanged(): boolean {
        for (var key in this.pristineEmailConfig) {
            if (this.pristineEmailConfig[key] != this.emailConfig[key]) {
                return true;
            }
        }
        return false;
    }

    /* ============================
     * Remote access config managment
     * ============================ */

    private initRemoteConfig() {
        this.preferenceService.getSystemSettings([Properties.setting_remote_configs]).subscribe(
            setting => {
                let remoteConfSetting = setting[Properties.setting_remote_configs];
                if (remoteConfSetting != null) {
                    let remoteAccessConfigurations = <RemoteRepositoryAccessConfig[]>JSON.parse(remoteConfSetting);
                    if (remoteAccessConfigurations.length > 0) {
                        this.remoteAccessConfig = remoteAccessConfigurations[0];
                    }
                }
                this.pristineRemoteAccessConf = Object.assign({}, this.remoteAccessConfig);
            }
        );
    }

    updateRemoteConfig() {
        this.preferenceService.setSystemSetting(Properties.setting_remote_configs, JSON.stringify([this.remoteAccessConfig])).subscribe(
            stResp => {
                this.initRemoteConfig();
            }
        );
    }

    isRemoteConfigChanged() {
        for (var key in this.pristineRemoteAccessConf) {
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
        this.preferenceService.getSystemSettings([Properties.setting_vb_connection]).subscribe(
            setting => {
                let vb_conn_value: string = setting[Properties.setting_vb_connection];
                if (vb_conn_value != null) {
                    this.vbConnectionConfig = JSON.parse(vb_conn_value);
                }
                this.pristineVbConnConfig = Object.assign({}, this.vbConnectionConfig);
            }
        );
    }

    updateVbConfig() {
        this.preferenceService.setSystemSetting(Properties.setting_vb_connection, JSON.stringify(this.vbConnectionConfig)).subscribe(
            () => {
                this.initVbConfig();
            }
        )
    }

    testVbConnection() {
        if (
            (!this.vbConnectionConfig.adminEmail || this.vbConnectionConfig.adminEmail.trim() == "") ||
            (!this.vbConnectionConfig.adminPassword || this.vbConnectionConfig.adminPassword.trim() == "") ||
            (!this.vbConnectionConfig.stHost || this.vbConnectionConfig.stHost.trim() == "")
        ) {
            this.basicModals.alert("VocBench configuration test", "VocBench configuration is incomplete. Please fill all the fields and retry.", ModalType.warning);
            return;
        }
        if (this.isVbConfigChanged()) {
            this.basicModals.alert("VocBench configuration test", "VocBench configuration has been changed, you need first to submit the changes.", ModalType.warning);
            return;
        }
        this.testVbConfigLoading = true;
        this.pmkiService.testVocbenchConfiguration().pipe(
            finalize(() => this.testVbConfigLoading = false)
        ).subscribe(
            () => {
                this.basicModals.alert("VocBench configuration test", "The configuration has been tested successfully");
            },
            (error: Error) => {
                console.log("error", error);
                this.basicModals.alert("VocBench configuration test", "Test failed, the configuration provided is not correct.", ModalType.error, error.message);
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

class EmailConfig {
    public mailFromAddress: string;
    public mailFromPassword: string;
    public mailFromAlias: string;
    public mailSmtpAuth: boolean;
    public mailSmtpSslEnable: boolean;
    public mailSmtpStarttlsEnable: boolean;
    public mailSmtpHost: string;
    public mailSmtpPort: string;
}

class VbConnectionConfig {
    vbUrl: string;
    stHost: string;
    adminEmail: string;
    adminPassword: string;
}