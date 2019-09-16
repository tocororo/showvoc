import { Component, OnInit } from '@angular/core';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
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
export class LoginComponent implements OnInit {

    email: string;
    password: string;

    constructor(private userService: UserServices, private basicModals: BasicModalsServices) { }

    ngOnInit() { }

    login() {
        this.basicModals.alert("Loggin in...", "TODO");
    }

    forgotPassword() {
        this.basicModals.prompt("Forgot password", { value: "E-mail" }, "Insert the e-mail address of your account. " + 
            "You will receive an e-mail with the instructions for resetting the password").then(
            (email: string) => {
                this.userService.forgotPassword(email).subscribe(
                    stResp => {
                        this.basicModals.alert("Forgot password", "An e-mail with the instructions for resetting password has been sent to the provided address.");
                    }
                );
            },
            () => {}
        );
    }



}
