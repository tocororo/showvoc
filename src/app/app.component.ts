import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { User } from './models/User';
import { AuthServices } from './services/auth.service';
import { Cookie } from './utils/Cookie';
import { PMKIContext } from './utils/PMKIContext';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    host: {
        class: 'd-flex flex-column',
    },
})
export class AppComponent {

    // appVersion = require('../../package.json').version;

    navbarCollapsed: boolean = true;

    private currentUser: User;

    translateLangs: string[];
    translateLang: string;

    constructor(private authServices: AuthServices, private translate: TranslateService) {
        //set the available factory-provided i18n languages
        translate.addLangs(['en', 'it']);
        //add additional supported i18n languages
        let additionalLangs: string[] = window['additional_i18n_langs'];
        if (additionalLangs.length > 0) {
            translate.addLangs(additionalLangs);
        }
        //fallback when a translation isn't found in the current language
        translate.setDefaultLang('en');
        //restore the lang to use, check first the cookies, if not found, set english by default
        let langCookie: string = Cookie.getCookie(Cookie.TRANSLATE_LANG);
        if (langCookie != null && translate.getLangs().includes(langCookie)) {
            translate.use(langCookie);
        } else {
            translate.use('en');
        }
    }

    ngOnInit() {
        this.translateLangs = this.translate.getLangs();
        this.translateLang = this.translate.currentLang;
    }

    /**
     * Determines if the items in the navbar are available: they are available only if the admin or the visitor user is logged
     */
    isLogged(): boolean {
        return PMKIContext.getLoggedUser() != null;
    }

    /**
     * Determines if the login button and the link for the admin dashboard are available
     * - the login button should be visible if the only visitor is logged (returns false)
     * - the links for the admin dashboard should be visible only if the admin is logged (returns true)
     */
    isAdminLogged(): boolean {
        this.currentUser = PMKIContext.getLoggedUser();
        return this.currentUser != null && this.currentUser.isAdmin();
    }

    logout() {
        this.authServices.logout().subscribe(); //no need to login again as visitor, the auth guard will do the job
    }

    changeLang(lang: string) {
        this.translateLang = lang;
        this.translate.use(this.translateLang);
        Cookie.setCookie(Cookie.TRANSLATE_LANG, this.translateLang);
    }

}
