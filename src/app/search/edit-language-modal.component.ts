import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';

@Component({
    selector: 'edit-lang-modal',
    templateUrl: './edit-language-modal.component.html'
})
export class EditLanguageModal implements OnInit {

    @Input() languages: string[];

    newLang: string;
    private langRegexp = new RegExp("^[a-z]{2,3}(?:-[A-Z]{2,3}(?:-[a-zA-Z]{4})?)?$");

    constructor(private activeModal: NgbActiveModal, private basicModals: BasicModalsServices) { }

    ngOnInit() {
    }

    addLang() {
        if (this.languages.indexOf(this.newLang) != -1) {
            this.basicModals.alert({ key: "COMMONS.STATUS.INVALID_DATA" }, { key: "MESSAGES.LANGUAGE_ALREAY_IN_LIST", params: {lang: this.newLang} }, ModalType.warning);
            return;
        }
        if (!this.langRegexp.test(this.newLang)) {
            this.basicModals.alert({ key: "COMMONS.STATUS.INVALID_DATA" }, { key: "MESSAGES.LANGUAGE_INVALID_TAG", params: {lang: this.newLang} }, ModalType.warning);
            return;
        }
        this.languages.push(this.newLang);
        this.languages.sort((l1, l2) => l1.localeCompare(l2));
        this.newLang = null;
    }

    deleteLang(index: number) {
        this.languages.splice(index, 1);
    }

    ok() {
        //check for duplicated languages
        for (let i = 0; i < this.languages.length; i++) {
            let lang = this.languages[i];
            if (this.languages.indexOf(lang) != i) {
                this.basicModals.alert({ key: "COMMONS.STATUS.INVALID_DATA" }, { key: "MESSAGES.LANGUAGE_DUPLICATED", params: {lang: lang } }, ModalType.warning);
                return;
            }
        }
        //check for invalid languages
        for (let l of this.languages) {
            if (!this.langRegexp.test(l)) {
                this.basicModals.alert({ key: "COMMONS.STATUS.INVALID_DATA" }, { key: "MESSAGES.LANGUAGE_INVALID_TAG", params: {lang: l } }, ModalType.warning);
                return;
            }
        }
        this.activeModal.close(this.languages);
    }

    close() {
        this.activeModal.dismiss();
    }

}
