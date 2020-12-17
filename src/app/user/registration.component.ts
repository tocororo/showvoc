import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { UserForm } from '../models/User';
import { AuthServices } from '../services/auth.service';
import { PmkiServices } from '../services/pmki.service';
import { UserServices } from '../services/user.service';

@Component({
	selector: 'registration-component',
	templateUrl: './registration.component.html',
	host: { class: "pageComponent" }
})
export class RegistrationComponent implements OnInit {

	userForm: UserForm = new UserForm();

	constructor(private userService: UserServices, private authService: AuthServices, private pmkiService: PmkiServices,
		private basicModals: BasicModalsServices, private router: Router) { }

	ngOnInit() { }

	private isConfirmPwdOk() {
		return this.userForm.password == this.userForm.confirmedPassword;
	}

	isSumbitEnabled(): boolean {
		return (
			(!this.userForm.email || this.userForm.email.trim() == "") ||
			(!this.userForm.password || this.userForm.password.trim() == "") ||
			(!this.userForm.confirmedPassword || this.userForm.confirmedPassword.trim() == "") ||
			(!this.userForm.givenName || this.userForm.givenName.trim() == "") ||
			(!this.userForm.familyName || this.userForm.familyName.trim() == "")
		);
	}

	submit() {
		//check email
		if (!UserForm.isValidEmail(this.userForm.email)) {
			this.basicModals.alert("COMMONS.STATUS.INVALID_DATA", "Please enter a valid e-mail address", ModalType.warning);
			return;
		}
		//check password
		if (!this.isConfirmPwdOk()) {
			this.basicModals.alert("COMMONS.STATUS.INVALID_DATA", "Password and confirmed password are different.", ModalType.warning);
			return;
		}

		/**
		 * Register the user, then immediately log-in and invoke the initialization of PMKI stuff (initPMKI()).
		 * The login is required since initPMKI can be invoked only by the admin.
		 * Finally navigate to the system configuration page.
		 * Note: even the message says "Now you will be automatically logged in", the login is performed immediately after the registration.
		 * This is to prevent that the user closes the app after the registration and so skip the initialization of stuff needful for PMKI.
		 */
		this.userService.registerUser(this.userForm.email, this.userForm.password, this.userForm.givenName, this.userForm.familyName).subscribe(
			() => {
				this.authService.login(this.userForm.email, this.userForm.password).subscribe(
					user => {
						this.pmkiService.initPMKI().subscribe();
					}
				);
				this.basicModals.alert("USER.REGISTRATION_COMPLETE", "The administrator account has been created. " +
					"Now you will be automatically logged in with the email (" + this.userForm.email + ") and the password you provided").then(
						() => {
							this.router.navigate(["/sysconfig"]);
						}
					);
			}
		)
	}

}
