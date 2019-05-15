import { Component, OnInit } from '@angular/core';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';

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

    private email: string;
    private password: string;

    constructor(private basicModals: BasicModalsServices) { }

    ngOnInit() { }

    login() {
        console.log("login", this.email, this.password);
        this.basicModals.alert("Loggin in...", "TODO");
    }

    forgotPassword() {
        this.basicModals.alert("Forgot Password", "TODO");
    }



}
