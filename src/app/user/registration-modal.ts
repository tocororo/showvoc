import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BasicModalsServices } from "../modal-dialogs/basic-modals/basic-modals.service";
import { ModalType } from "../modal-dialogs/Modals";
import { UserForm } from "../models/User";

@Component({
    selector: "registration-modal",
    templateUrl: "./registration-modal.html",
})
export class RegistrationModal {

    @Input() title: string;

    userForm: UserForm;

    constructor(public activeModal: NgbActiveModal, private basicModals: BasicModalsServices) {
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

    private isConfirmPwdOk() {
        return this.userForm.password == this.userForm.confirmedPassword;
    }

    ok() {
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
        this.activeModal.close(this.userForm)
    }

    close() {
        this.activeModal.dismiss();
    }

}