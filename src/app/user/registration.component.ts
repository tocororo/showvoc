import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { AuthServiceMode } from '../models/Properties';
import { UserForm } from '../models/User';
import { AuthServices } from '../services/auth.service';
import { ShowVocServices } from '../services/showvoc.service';
import { UserServices } from '../services/user.service';
import { SVContext } from '../utils/SVContext';
import { UserConstraint } from './user-create-form.component';

@Component({
    selector: 'registration-component',
    templateUrl: './registration.component.html',
    host: { class: "pageComponent" }
})
export class RegistrationComponent implements OnInit {

    private authServMode: AuthServiceMode;

    userForm: UserForm;
    constraintUser: UserConstraint;

    constructor(private userService: UserServices, private authService: AuthServices, private svService: ShowVocServices,
        private basicModals: BasicModalsServices, private router: Router, private activeRoute: ActivatedRoute) { }

    ngOnInit() {
        this.authServMode = SVContext.getSystemSettings().authService;
        if (this.authServMode == AuthServiceMode.SAML) {
            let constraintEmail = this.activeRoute.snapshot.queryParams['email'];
            if (constraintEmail) {
                let constraintGivenName = this.activeRoute.snapshot.queryParams['givenName'];
                let constraintFamilyName = this.activeRoute.snapshot.queryParams['familyName'];
                this.constraintUser = { email: constraintEmail, givenName: constraintGivenName, familyName: constraintFamilyName };
            } else { //data about the SAML user are not provided. Probably the page has been accessed manually. Redirect to Home
                this.router.navigate(["/Home"]);
            }
        }
    }

    private isConfirmPwdOk() {
        return this.userForm.password == this.userForm.confirmedPassword;
    }

    isDataValid(): boolean {
        return (
            this.userForm &&
            (this.userForm.email && this.userForm.email.trim() != "") &&
            (this.userForm.password && this.userForm.password.trim() != "") &&
            (this.userForm.confirmedPassword && this.userForm.confirmedPassword.trim() != "") &&
            (this.userForm.givenName && this.userForm.givenName.trim() != "") &&
            (this.userForm.familyName && this.userForm.familyName.trim() != "")
        );
    }

    submit() {
        if (!this.isDataValid()) return;

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

        this.userService.registerUser(this.userForm.email, this.userForm.password, this.userForm.givenName, this.userForm.familyName).subscribe(
            () => {
                /*
                Now, only in case of Default auth service mode, login the just registered admin
                (SAML registered user is automatically set/login server side)
                In both cases
                - initialize ShowVoc stuff (required admin to be logged)
                - show registration success message
                - redirect to Sysconfig page
                */
                if (this.authServMode == AuthServiceMode.Default) {
                    this.authService.login(this.userForm.email, this.userForm.password).subscribe(
                        () => {
                            this.initShowVocAndRedirect();
                        }
                    );
                } else {
                    this.initShowVocAndRedirect();
                }

            }
        );
    }

    private initShowVocAndRedirect() {
        //initShowVoc is invoked before the "success" message in order to prevent that the user closes the app after the registration skip the initialization of stuff needful for ShowVoc.
        this.svService.initShowVoc().subscribe();
        this.basicModals.alert({ key: "USER.REGISTRATION_COMPLETE" }, { key: "MESSAGES.ADMIN_CREATED" }).then(
            () => {
                this.router.navigate(["/sysconfig"]);
            }
        );
    }

}
