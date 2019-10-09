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
	 * Determines if the login button and the link for the admin dashboard are available
	 * - the login button should be visible if the only visitor is logged (returns false)
	 * - the links for the admin dashboard should be visible only if the admin is logged (returns true)
	 */
	isAdminLogged(): boolean {
		let loggedUser = PMKIContext.getLoggedUser();
		return loggedUser != null && loggedUser.isAdmin();
	}

	logout() {
		//login again as visitor? or let the auth guard do the job?
		this.authServices.logout().subscribe();
	}



}
