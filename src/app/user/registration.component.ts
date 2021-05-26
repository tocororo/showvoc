import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { UserForm } from '../models/User';
import { AuthServices } from '../services/auth.service';
import { ShowVocServices } from '../services/showvoc.service';
import { UserServices } from '../services/user.service';

@Component({
	selector: 'registration-component',
	templateUrl: './registration.component.html',
	host: { class: "pageComponent" }
})
export class RegistrationComponent implements OnInit {

	userForm: UserForm = new UserForm();

	constructor(private userService: UserServices, private authService: AuthServices, private svService: ShowVocServices,
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
			this.basicModals.alert({ key: "COMMONS.STATUS.INVALID_DATA" }, { key: "MESSAGES.ENTER_VALID_EMAIL" }, ModalType.warning);
			return;
		}
		//check password
		if (!this.isConfirmPwdOk()) {
			this.basicModals.alert({ key: "COMMONS.STATUS.INVALID_DATA" }, { key: "MESSAGES.DIFFERENT_CONFIRM_PASSWORD" }, ModalType.warning);
			return;
		}

		/**
		 * Register the user, then immediately log-in and invoke the initialization of ShowVoc stuff (initPMKI()).
		 * The login is required since initPMKI can be invoked only by the admin.
		 * Finally navigate to the system configuration page.
		 * Note: even the message says "Now you will be automatically logged in", the login is performed immediately after the registration.
		 * This is to prevent that the user closes the app after the registration and so skip the initialization of stuff needful for ShowVoc.
		 */
		this.userService.registerUser(this.userForm.email, this.userForm.password, this.userForm.givenName, this.userForm.familyName).subscribe(
			() => {
				this.authService.login(this.userForm.email, this.userForm.password).subscribe(
					user => {
						this.svService.initPMKI().subscribe();
					}
				);
				this.basicModals.alert({ key: "USER.REGISTRATION_COMPLETE" }, { key: "MESSAGES.ADMIN_CREATED" }).then(
						() => {
							this.router.navigate(["/sysconfig"]);
						}
					);
			}
		)
	}

}
