import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { from, Observable, of } from 'rxjs';
import { finalize, map, mergeMap, tap } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalOptions, ModalType } from 'src/app/modal-dialogs/Modals';
import { ExtensionPointID, Scope, Settings, STProperties } from 'src/app/models/Plugins';
import { RemoteRepositoryAccessConfig } from 'src/app/models/Project';
import { AuthServiceMode, SettingsEnum, ShowVocSettings, VocBenchConnectionShowVocSettings } from 'src/app/models/Properties';
import { User, UserForm } from 'src/app/models/User';
import { AdministrationServices } from 'src/app/services/administration.service';
import { SettingsServices } from 'src/app/services/settings.service';
import { ShowVocServices } from 'src/app/services/showvoc.service';
import { UserServices } from 'src/app/services/user.service';
import { RegistrationModal } from 'src/app/user/registration-modal';
import { Cookie } from 'src/app/utils/Cookie';
import { SVContext } from 'src/app/utils/SVContext';

@Component({
    selector: 'system-config',
    templateUrl: './system-configuration.component.html',
    host: { class: "vbox" }
})
export class SystemConfigurationComponent implements OnInit {

    private getSystemCoreSettingsFn: Observable<Settings> = this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM);

    /* Administrators */
    currentUser: User; //used to disable delete btn in admin list (user cannot delete itself)
    private users: User[];
    adminList: User[];
    superUserList: User[];

    /* ST+VB configuration */
    private showVocSettings: ShowVocSettings;
    vbConnectionConfig: VocBenchConnectionShowVocSettings = new VocBenchConnectionShowVocSettings();
    private pristineVbConnConfig: VocBenchConnectionShowVocSettings;
    
    testVbConfigLoading: boolean;

    /* Remote access configuration */

    private remoteConfigsSetting: RemoteRepositoryAccessConfig[]; //on ST remote config is a list, here in ShowVoc it is shown just the first
    remoteAccessConfig: RemoteRepositoryAccessConfig = { serverURL: null, username: null, password: null };
    private pristineRemoteAccessConf: RemoteRepositoryAccessConfig;

    /* E-mail configuration */

    emailSettings: MailSettings;
    private emailSettingsPristine: MailSettings;
    cryptoProtocol: string;

    testEmailConfigLoading: boolean;

    /* Other */
    disableContributions: boolean;

    authServiceModes: AuthServiceMode[] = [AuthServiceMode.Default, AuthServiceMode.SAML];
    selectedAuthServiceMode: AuthServiceMode;

    
    constructor(private adminService: AdministrationServices, private svService: ShowVocServices, private settingsService: SettingsServices,
        private usersService: UserServices, private basicModals: BasicModalsServices, private modalService: NgbModal,
        private translateService: TranslateService) { }

    ngOnInit() {
        this.currentUser = SVContext.getLoggedUser();
        this.initAll()
    }

    private initAll() {
        this.getSystemCoreSettingsFn.subscribe(
            settings => {
                this.initUsersListConfigHandler(settings);
                this.initEmailConfigHandler(settings);
                this.initRemoteConfigHandler(settings);
                this.initVbConfigHandler(settings);
                this.initOtherConfig(settings);
            }
        )
    }


    /* ============================
     * Admin managment
     * ============================ */

    private initUsersListConfig() {
        this.getSystemCoreSettingsFn.subscribe(
            settings => {
                this.initUsersListConfigHandler(settings);
            }
        )
    }

    private initUsersListConfigHandler(settings: Settings) {
        this.ensureUsersInitialized().subscribe(
            () => {
                let adminIriList: string[] = settings.getPropertyValue(SettingsEnum.adminList);
                this.adminList = adminIriList.map(iri => this.users.find(u => u.getIri() == iri)).filter(u => u != null);
                let superUserIriList: string[] = settings.getPropertyValue(SettingsEnum.superUserList);
                this.superUserList = superUserIriList.map(iri => this.users.find(u => u.getIri() == iri)).filter(u => u != null);
            }
        );
    }

    private ensureUsersInitialized(): Observable<void> {
        if (this.users == null) {
            return this.usersService.listUsers().pipe(
                map(users => {
                    this.users = users;
                })
            )
        } else {
            return of(null);
        }
    }

    createAdministrator() {
        this.createUser("ADMINISTRATION.SYSTEM.USERS.ADD_ADMIN").subscribe(
            (user: User) => {
                this.users = null; //so forces ensureUsersInitialized to reinit users list
                this.adminService.setAdministrator(user).subscribe(
                    () => {
                        this.initUsersListConfig();
                    }
                );
            }
        )
    }

    createSuperUser() {
        this.createUser("ADMINISTRATION.SYSTEM.USERS.ADD_SUPER_USER").subscribe(
            (user: User) => {
                this.users = null; //so forces ensureUsersInitialized to reinit users list
                this.adminService.setSuperUser(user).subscribe(
                    () => {
                        this.initUsersListConfig();
                    }
                );
            }
        )
    }

    private createUser(titleTranslationKey: string): Observable<User> {
        let modalRef: NgbModalRef = this.modalService.open(RegistrationModal, new ModalOptions('lg'));
        modalRef.componentInstance.title = this.translateService.instant(titleTranslationKey);
        return from(
            modalRef.result.then(
                (userForm: UserForm) => {
                    return this.usersService.createUser(userForm.email, userForm.password, userForm.givenName, userForm.familyName);
                }
            )
        ).pipe(
            mergeMap(user => user)
        );
    }

    changeUserType(user: User) {
        let msgTranslationKey = user.isAdmin() ? "MESSAGES.CHANGE_USER_TYPE_ADMIN_TO_SUPER_CONFIRM" : "MESSAGES.CHANGE_USER_TYPE_SUPER_TO_ADMIN_CONFIRM";
        this.basicModals.confirmCheckCookie({key: "COMMONS.STATUS.WARNING"}, { key: msgTranslationKey, params: { user: user.getShow() } }, Cookie.WARNING_ADMIN_CHANGE_USER_TYPE, ModalType.warning).then(
            () => {
                let removeFn: Observable<void>;
                let addFn: Observable<void>;
                if (user.isAdmin()) { // admin to superuser
                    removeFn = this.adminService.removeAdministrator(user).pipe(tap(() => { user.setAdmin(false) }));
                    addFn = this.adminService.setSuperUser(user).pipe(tap(() => { user.setSuperUser(true) }));
                } else { // superuser to admin
                    removeFn = this.adminService.removeSuperUser(user).pipe(tap(() => { user.setSuperUser(false) }));
                    addFn = this.adminService.setAdministrator(user).pipe(tap(() => { user.setAdmin(true) }));
                }
                removeFn.subscribe(
                    () => {
                        addFn.subscribe(
                            () => {
                                this.initUsersListConfig();
                            }
                        );
                    }
                );
            },
            () => {}
        )
    }

    deleteUser(user: User) {
        this.basicModals.confirm({ key: "COMMONS.STATUS.WARNING" }, { key: "MESSAGES.DELETE_USER_CONFIRM_WARN", params: { user: user.getShow() } }, ModalType.warning).then(
            () => {
                this.usersService.deleteUser(user.getEmail()).subscribe(
                    () => {
                        this.users = null; //so forces the users list to be reinitialized
                        this.initUsersListConfig();
                    }
                )
            }, 
            () => {}
        );
    }


    /* ============================
     * E-mail managment
     * ============================ */

    private initEmailConfig() {
        this.getSystemCoreSettingsFn.subscribe(
            settings => {
                this.initEmailConfigHandler(settings);
            }
        )
    }

    private initEmailConfigHandler(settings: Settings) {
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
            SVContext.getLoggedUser().getEmail()).then(
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
        this.showVocSettings = settings.getPropertyValue(SettingsEnum.showvoc)
        if (this.showVocSettings == null) {
            this.showVocSettings = new ShowVocSettings()
        }

        if (this.showVocSettings.vbConnectionConfig != null) {
            this.vbConnectionConfig = this.showVocSettings.vbConnectionConfig
        }
        this.pristineVbConnConfig = Object.assign({}, this.vbConnectionConfig);
    }

    updateVbConfig() {
        this.showVocSettings.vbConnectionConfig = this.vbConnectionConfig;
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM, SettingsEnum.showvoc, this.showVocSettings).subscribe(
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
        this.svService.testVocbenchConfiguration().pipe(
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
        for (let key in this.pristineVbConnConfig) {
            if (this.pristineVbConnConfig[key] != this.vbConnectionConfig[key]) {
                return true;
            }
        }
        return false;
    }

    /* ============================
     * Others
     * ============================ */

    private initOtherConfig(settings: Settings) {
        this.disableContributions = this.showVocSettings.disableContributions; //showVocSettings is already initialized in initVbConfigHandler which is invoked before initOtherConfig in initAll
        
        this.selectedAuthServiceMode = SVContext.getSystemSettings().authService;
    }

    updateDisableContributions() {
        SVContext.getSystemSettings().disableContributions = this.disableContributions;
        this.showVocSettings.disableContributions = this.disableContributions;
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM, SettingsEnum.showvoc, this.showVocSettings).subscribe();
    }


    onAuthServiceChanged(newValue: AuthServiceMode) {
        let oldValue = this.selectedAuthServiceMode
        this.basicModals.confirm({key:"COMMONS.STATUS.WARNING"}, {key:"MESSAGES.AUTH_MODE_CHANGE_WARN"}, ModalType.warning).then(
            () => {
                this.selectedAuthServiceMode = newValue;
                this.updateAuthServiceMode();
            },
            () => { //change rejected, restore previous value
                //this "hack" is needed in order to force the ngModel to detect the change
                this.selectedAuthServiceMode = null;
                setTimeout(() => {
                    this.selectedAuthServiceMode = oldValue;
                });
            }
        )
    }

    private updateAuthServiceMode() {
        SVContext.getSystemSettings().authService = this.selectedAuthServiceMode;
        this.settingsService.storeSetting(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM, SettingsEnum.authService, this.selectedAuthServiceMode).subscribe();
    }

}

class MailSettings {
    smtp: {
        auth: boolean,
        host: string,
        port: number,
        sslEnabled: boolean,
        starttlsEnabled: boolean
        sslProtocols: string,
    };
    from: {
        address: string,
        password: string,
        alias: string,
    }
}