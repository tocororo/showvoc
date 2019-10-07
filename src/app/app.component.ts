import { Component } from '@angular/core';
import { AuthServices } from './services/auth.service';
import { PMKIContext } from './utils/PMKIContext';

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	host: {
		class: 'd-flex flex-column',
	},
	styles: [`
		.dropdown-toggle.dropdown-no-arrow::after {
			display:none;
		}
		`]
})
export class AppComponent {

	// appVersion = require('../../package.json').version;

	navbarCollapsed: boolean = true;

	constructor(private authServices: AuthServices) { }

	/**
	 * Determines if the login button and the user menu should be visible:
	 * The login button should be visible only if no user is logged.
	 * The user menu should be visible only if there is a logged user.
	 * Note that a PMKI "visitor" is not considered as logged user. As logged user are considered the PMKI admin or a contributor.
	 */
	isUserLogged(): boolean {
		return PMKIContext.getLoggedUser() != null;
	}

	/**
	 * Determines if the link for the admin dashboard is available in the user menu
	 * TODO at the moment returns always true, to update once the PMKI roles aspect is properly handled
	 */
	isAdmin(): boolean {
		let loggedUser = PMKIContext.getLoggedUser();
		return true;
	}

	logout() {
		/**
		 * TODO should logout ad admin/contributor and login again as visitor
		 */
		// this.authServices.logout().subscribe();
	}



}
