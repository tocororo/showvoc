import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ShowVocUrlParams } from './models/ShowVoc';
import { User } from './models/User';
import { AuthServices } from './services/auth.service';
import { Cookie } from './utils/Cookie';
import { HttpManager } from './utils/HttpManager';
import { SVContext } from './utils/SVContext';
import { ToastService } from './widget/toast/toast-service';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    host: {
        class: 'd-flex flex-column',
    },
})
export class AppComponent {

    appVersion = require('../../package.json').version;

    navbarCollapsed: boolean = true;

    private currentUser: User;

    translateLangs: string[];
    translateLang: string;

    hideNav: boolean;

    constructor(private authServices: AuthServices, private translate: TranslateService, private toastService: ToastService, private activatedRoute: ActivatedRoute) {
        this.activatedRoute.queryParams.subscribe(
            params => {
                this.hideNav = params[ShowVocUrlParams.hideNav] == "true";
            }
        );

        //set the available factory-provided l10n languages
        translate.addLangs(['de', 'en', 'es', 'fr', 'it']);
        //add additional supported l10n languages
        let additionalLangs: string[] = window['additional_l10n_langs'];
        if (additionalLangs.length > 0) {
            translate.addLangs(additionalLangs);
        }
        //fallback when a translation isn't found in the current language
        translate.setDefaultLang('en');
        //restore the lang to use, check first the cookies, if not found, set english by default
        let transLang: string = Cookie.getCookie(Cookie.TRANSLATE_LANG);
        if (transLang == null || !translate.getLangs().includes(transLang)) {
            transLang = "en";
        }
        this.changeLang(transLang);
    }

    ngOnInit() {
        this.translateLangs = this.translate.getLangs();
        this.translateLang = this.translate.currentLang;
    }

    isNavVisible(): boolean {
        return this.isAuthorizedUserLogged() || !this.hideNav;
    }

    /**
     * Determines if the items in the navbar are available: they are available only if the admin or the visitor user is logged
     */
    isLogged(): boolean {
        return SVContext.getLoggedUser() != null;
    }

    /**
     * Determines if the login button and the link for the admin dashboard are available
     * - the login button should be visible if the logged user is visitor (returns false)
     * - the links for the admin dashboard should be visible only if the logged user is admin or superuser (returns true)
     */
    isAuthorizedUserLogged(): boolean {
        this.currentUser = SVContext.getLoggedUser();
        return this.currentUser != null && this.currentUser.isSuperUser(false);
    }

    logout() {
        this.authServices.logout().subscribe(); //no need to login again as visitor, the auth guard will do the job
    }

    changeLang(lang: string) {
        this.translateLang = lang;
        this.translate.use(this.translateLang);
        Cookie.setCookie(Cookie.TRANSLATE_LANG, this.translateLang, null, null, { path: "/" });
    }

    copyWebApiUrl() {
        let baseUrl = HttpManager.getServerHost() + "/" + HttpManager.serverpath + "/" + 
            HttpManager.groupId + "/" + HttpManager.artifactId + "/";
        navigator.clipboard.writeText(baseUrl).then(() => {
            this.toastService.show(null, { key: "APP.FOOTER.WEB_API_COPIED" }, { toastClass: "bg-dark", textClass: "text-white" });
        }, (err) => {});
    }

}
