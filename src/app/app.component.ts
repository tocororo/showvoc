import { Component } from '@angular/core';
import { User } from './models/User';
import { AuthServices } from './services/auth.service';
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

    constructor(private authServices: AuthServices) { }

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

}
