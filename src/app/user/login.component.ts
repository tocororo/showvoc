import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { AuthServices } from '../services/auth.service';
import { UserServices } from '../services/user.service';

@Component({
    selector: 'login-component',
    templateUrl: './login.component.html',
    host: { class: "pageComponent" },
    styles: [`
    :host { 
        background-color: #f5f5f5;
    }
    .form-signin {
        width: 100%;
        max-width: 330px;
        padding: 15px;
        margin: auto;
    }
    `]
})
export class LoginComponent {

    email: string;
    password: string;

    constructor(private authService: AuthServices, private userService: UserServices, private basicModals: BasicModalsServices, private router: Router) { }

    login() {
        this.authService.login(this.email, this.password).subscribe(
            () => {
                this.router.navigate(["/home"]);
            }
        );
    }

    forgotPassword() {
        this.basicModals.prompt({ key: "USER.PASSWORD.FORGOT_PASSWORD" }, { value: "E-mail" }, { key: "MESSAGES.INSERT_EMAIL_FOR_RESET_PASSWORD" }).then(
            (email: string) => {
                this.userService.forgotPassword(email).subscribe(
                    () => {
                        this.basicModals.alert({ key: "USER.PASSWORD.FORGOT_PASSWORD" }, { key: "MESSAGES.RESET_PASSWORD_EMAIL_SENT" });
                    }
                );
            },
            () => {}
        );
    }



}
