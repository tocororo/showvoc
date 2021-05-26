import { Component } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from '../modal-dialogs/Modals';
import { User } from "../models/User";
import { UserServices } from '../services/user.service';
import { SVContext } from '../utils/SVContext';
import { ChangePasswordModal } from './change-password-modal';

@Component({
    selector: "user-profile",
    templateUrl: "./user-profile.component.html",
    host: { class: "pageComponent" }
})
export class UserProfileComponent {

    user: User;

    constructor(private userService: UserServices, private modalService: NgbModal) { }

    ngOnInit() {
        this.user = SVContext.getLoggedUser();
    }

    updateGivenName(newGivenName: string) {
        this.userService.updateUserGivenName(this.user.getEmail(), newGivenName).subscribe(
            user => {
                SVContext.setLoggedUser(user);
            }
        )
    }

    updateFamilyName(newFamilyName: string) {
        this.userService.updateUserFamilyName(this.user.getEmail(), newFamilyName).subscribe(
            user => {
                SVContext.setLoggedUser(user);
            }
        )
    }

    updateEmail(newEmail: string) {
        this.userService.updateUserEmail(this.user.getEmail(), newEmail).subscribe(
            user => {
                SVContext.setLoggedUser(user);
            }
        )
    }

    changePwd() {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(ChangePasswordModal, _options);
        return modalRef.result;
    }

}