import { Component, OnInit } from '@angular/core';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { UserServices } from '../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'reset-password-component',
    templateUrl: './reset-password.component.html',
    host: { class: "pageComponent" }
})
export class ResetPasswordComponent implements OnInit {

    email: string;
    token: string;

    loading: boolean;

    constructor(private userService: UserServices, private basicModals: BasicModalsServices, private router: Router, private activeRoute: ActivatedRoute) { }

    ngOnInit() {
        this.token = this.activeRoute.snapshot.params['token'];
    }

    isEmailValid(): boolean {
        return (this.email != null && this.email.trim() != "");
    }

    reset() {
        this.loading = true;
        this.userService.resetPassword(this.email, this.token).pipe(
            finalize(() => { this.loading = false; })
        ).subscribe(
            stResp => {
                this.basicModals.alert({ key: "USER.PASSWORD.RESET_PASSWORD" }, { key: "MESSAGES.PASSWORD_RESET_SUCCESS" }).then(
                    () => {
                        this.router.navigate(["/login"]);
                    }
                );
            }
        );
    }

}
