import { Component, OnInit } from '@angular/core';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { UserForm } from '../models/User';

@Component({
	selector: 'registration-component',
	templateUrl: './registration.component.html',
	host: { class: "pageComponent" }
})
export class RegistrationComponent implements OnInit {

	userForm: UserForm = new UserForm();

	constructor(private basicModals: BasicModalsServices) { }

	ngOnInit() {}

	private isConfirmPwdOk() {
        return this.userForm.password == this.userForm.confirmedPassword;
	}
	
	submit() {
		console.log("submit", this.userForm);
		//check all required parameter
        if (!this.userForm.email || 
            (!this.userForm.password || this.userForm.password.trim() == "") ||
            (!this.userForm.confirmedPassword || this.userForm.confirmedPassword.trim() == "") ||
            (!this.userForm.givenName || this.userForm.givenName.trim() == "") ||
            (!this.userForm.familyName || this.userForm.familyName.trim() == "")) {
            this.basicModals.alert("Invalid data", "Please fill all the fields", ModalType.warning);
            return;
        }
        //check email
        if (!UserForm.isValidEmail(this.userForm.email)) {
            this.basicModals.alert("Invalid data", "Please enter a valid e-mail address", ModalType.warning);
            return;
		}
		//check password
		if (!this.isConfirmPwdOk()) {
			this.basicModals.alert("Invalid data", "Password and confirmed password are different.", ModalType.warning);
		}

		this.basicModals.alert("Registration", "TODO");
	}

}
