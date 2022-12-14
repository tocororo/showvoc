import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { AuthServiceMode } from '../models/Properties';
import { AuthServices } from '../services/auth.service';
import { UserServices } from '../services/user.service';
import { HttpManager } from '../utils/HttpManager';
import { SVContext } from '../utils/SVContext';

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

    @ViewChild("samlForm", { static: true }) samlFormEl: ElementRef;

    email: string;
    password: string;

    authServMode: AuthServiceMode;

    samlAction: string;

    constructor(private authService: AuthServices, private userService: UserServices, private basicModals: BasicModalsServices, private router: Router) { }

    ngOnInit() {
        this.authServMode = SVContext.getSystemSettings().authService;

        let serverhost = HttpManager.getServerHost();
        this.samlAction = serverhost + "/semanticturkey/it.uniroma2.art.semanticturkey/st-core-services/saml/login";
    }

    ngAfterViewInit() {
        //in case of saml authentication, right after the view is init (required in order to let the view init samlForm), submit the form
        if (this.authServMode == AuthServiceMode.SAML) {
            let form: HTMLFormElement = this.samlFormEl.nativeElement;
            form.submit();
        }
    }

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
