import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { AuthServices } from '../services/auth.service';
import { UserServices } from '../services/user.service';
import { PMKIContext } from '../utils/PMKIContext';

@Component({
    selector: "change-pwd-modal",
    templateUrl: "./change-password-modal.html",
})
export class ChangePasswordModal {

    oldPwd: string;
    newPwd: string;
    newPwdConfirm: string;

    constructor(public activeModal: NgbActiveModal, private userService: UserServices, private authService: AuthServices, 
        private basicModals: BasicModalsServices) {
    }

    isInputValid(): boolean {
        return (
            this.oldPwd != undefined && this.oldPwd.trim() != "" &&
            this.newPwd != undefined && this.newPwd.trim() != "" &&
            this.newPwdConfirm != undefined && this.newPwdConfirm.trim() != "" &&
            this.isNewPwdConfirmOk()
        );
    }

    isNewPwdConfirmOk(): boolean {
        return this.newPwd == this.newPwdConfirm;
    }


    ok() {
        this.userService.changePassword(PMKIContext.getLoggedUser().getEmail(), this.oldPwd, this.newPwd).subscribe(
            () => {
                this.basicModals.alert("USER.PASSWORD.PASSWORD_CHANGED", "Your password has been succesfully changed. Now you will be logged out.").then(
                    () => {
                        this.authService.logout().subscribe(
                            () => {
                                this.activeModal.close()
                            }
                        );
                    }
                );
            }
        );
    }

    close() {
        this.activeModal.dismiss();
    }
}