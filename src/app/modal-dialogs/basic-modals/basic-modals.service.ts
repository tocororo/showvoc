import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Cookie } from 'src/app/utils/Cookie';
import { CheckOptions, ModalOptions, ModalType, TextOrTranslation, TranslationUtils } from '../Modals';
import { AlertModal } from './alert-modal/alert-modal';
import { ConfirmCheckModal } from './confirm-modal/confirm-check-modal';
import { ConfirmModal } from './confirm-modal/confirm-modal';
import { DownloadModal } from './download-modal/download-modal';
import { FilePickerModal } from './file-picker-modal/file-picker-modal';
import { PromptModal } from './prompt-modal/prompt-modal';
import { PromptNumberModal } from './prompt-modal/prompt-number-modal';
import { SelectionModal, SelectionOption } from './selection-modal/selection-modal';

@Injectable()
export class BasicModalsServices {

    constructor(private modalService: NgbModal, private translateService: TranslateService) { }

    /**
     * @param title 
     * @param msg
     * @param type if provided, the message will be put in an proper-styled alert
     * @param details if provided, the alert will contain an expandable section with further details
     * @param checkOpt if provided, alert shows a checkbox
     * @param options 
     */
    alert(title: TextOrTranslation, msg: TextOrTranslation, type?: ModalType, details?: string, checkOpt?: CheckOptions, options?: ModalOptions): Promise<CheckOptions> {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(AlertModal, _options);
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        modalRef.componentInstance.message = TranslationUtils.getTranslatedText(msg, this.translateService);
        modalRef.componentInstance.type = type;
        modalRef.componentInstance.details = details;
        modalRef.componentInstance.checkOpt = TranslationUtils.translateObject(checkOpt, ["label", "info", "warning"], this.translateService);
        return modalRef.result;
    }

    /**
     * Opens a modal with two buttons (Yes and No) with the given title and content message.
     * Returns a Promise with the result
     * @param title the title of the modal dialog
     * @param message the message to show in the modal dialog body
     * @param type tells the type of the dialog. Determines the style of the message in the dialog.
     * Available values: info (default), error, warning
     * @return if the modal closes with ok returns a promise containing a boolean true
     */
    confirm(title: TextOrTranslation, msg: TextOrTranslation, type?: ModalType, options?: ModalOptions) {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(ConfirmModal, _options);
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        modalRef.componentInstance.message = TranslationUtils.getTranslatedText(msg, this.translateService);
        modalRef.componentInstance.type = type;
        return modalRef.result;
    }

    /**
     * Opens a modal with two buttons (Yes and No) with a checkbox and the given title and content message.
     * Returns a Promise with the checkbox status
     * @param title the title of the modal dialog
     * @param message the message to show in the modal dialog body
     * @param checkOpts options for customizing the checkbox
     * @param type tells the type of the dialog. Determines the style of the message in the dialog.
     * Available values: info (default), error, warning
     * @return if the modal closes with ok returns a promise containing a boolean true
     */
    confirmCheck(title: TextOrTranslation, msg: TextOrTranslation, checkOpts: CheckOptions[], type?: ModalType, options?: ModalOptions) {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(ConfirmCheckModal, _options);
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        modalRef.componentInstance.message = TranslationUtils.getTranslatedText(msg, this.translateService);
        for (let i = 0; i < checkOpts.length; i++) {
            TranslationUtils.translateObject(checkOpts[i], ["label", "info", "warning"], this.translateService);
        }
        modalRef.componentInstance.checkOpts = checkOpts;
        modalRef.componentInstance.type = type;
        return modalRef.result;
    }

    /**
     * Open a modal that ask for confirmation. It uses the checkbox for "don't show/ask again". It stores the choice in a cookie.
     * If the cookie was set in order to not show the confirmation, it skips the dialog and simply returns an empty promise (like the user has confirmed)
     * @param title 
     * @param msg 
     * @param warningCookie 
     * @param type 
     * @returns 
     */
    confirmCheckCookie(title: TextOrTranslation, msg: TextOrTranslation, warningCookie: string, type?: ModalType): Promise<void> {
        let showWarning = Cookie.getCookie(warningCookie) != "false";
        if (showWarning) {
            let confCheckOpt: CheckOptions = {
                label: { key: "COMMONS.DONT_ASK_AGAIN" },
                value: false
            };
            return this.confirmCheck(title, msg, [confCheckOpt], type).then(
                (checkOpts: CheckOptions[]) => {
                    if (checkOpts[0].value) {
                        Cookie.setCookie(warningCookie, "false");
                    }
                }
            );
        } else {
            return new Promise((resolve, reject) => { resolve(); });
        }
    }

    /**
     * 
     * @param title 
     * @param label 
     * @param message 
     * @param value 
     * @param hideClose 
     * @param inputOptional 
     * @param options 
     */
    prompt(title: TextOrTranslation, label?: { value: string, tooltip?: string }, msg?: TextOrTranslation, value?: string, hideClose?: boolean, inputOptional?: boolean, options?: ModalOptions): Promise<string> {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(PromptModal, _options);
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        modalRef.componentInstance.label = label;
        modalRef.componentInstance.message = TranslationUtils.getTranslatedText(msg, this.translateService);
        modalRef.componentInstance.value = value;
        modalRef.componentInstance.hideClose = hideClose;
        modalRef.componentInstance.inputOptional = inputOptional;
        return modalRef.result;
    }

    /**
     * 
     * @param title 
     * @param message 
     * @param value 
     * @param min 
     * @param max 
     * @param step 
     * @param type 
     * @param options 
     */
    promptNumber(title: TextOrTranslation, msg: TextOrTranslation, value?: number, min?: number, max?: number, step?: number, type?: ModalType, options?: ModalOptions): Promise<number> {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(PromptNumberModal, _options);
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        modalRef.componentInstance.message = TranslationUtils.getTranslatedText(msg, this.translateService);
        modalRef.componentInstance.value = value;
        modalRef.componentInstance.min = min;
        modalRef.componentInstance.max = max;
        modalRef.componentInstance.step = step;
        modalRef.componentInstance.type = type;
        return modalRef.result;
    }

    /**
     * Opens a modal with an message and a list of selectable options.
     * @param title the title of the modal dialog
     * @param msg the message to show in the modal dialog body. If null no message will be in the modal
     * @param options array of options. This can be an array of string or an array of objects 
     * {value: string, description: string}, where the description is shown on mouseover of the option value
     * @return if the modal closes with ok returns a promise containing the selected option
     */
    select(title: TextOrTranslation, msg: TextOrTranslation, options: Array<string | SelectionOption>, type?: ModalType) {
        const modalRef: NgbModalRef = this.modalService.open(SelectionModal, new ModalOptions());
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        modalRef.componentInstance.message = TranslationUtils.getTranslatedText(msg, this.translateService);
        modalRef.componentInstance.options = options;
        if (type != null) modalRef.componentInstance.type = type;
        return modalRef.result;
    }

    /**
     * Opens a modal with a link to download a file
     * @param title the title of the modal dialog
     * @param message the message to show in the modal dialog body. If null no message will be in the modal
     * @param downloadLink link for download
     * @param fileName name of the file to download
     */
    downloadLink(title: TextOrTranslation, msg: TextOrTranslation, downloadLink: string, fileName: string, options?: ModalOptions) {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(DownloadModal, _options);
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        modalRef.componentInstance.message = TranslationUtils.getTranslatedText(msg, this.translateService);
        modalRef.componentInstance.downloadLink = downloadLink;
        modalRef.componentInstance.fileName = fileName;
        return modalRef.result;
    }

    /**
     * Opens a modal with a link to download a file
     * @param title the title of the modal dialog
     * @param msg the message to show in the modal dialog body. If null no message will be in the modal
     * @param downloadLink link for download
     * @param fileName name of the file to download
     */
    selectFile(title: TextOrTranslation, msg?: TextOrTranslation, accept?: string): Promise<File> {
        const modalRef: NgbModalRef = this.modalService.open(FilePickerModal, new ModalOptions());
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        modalRef.componentInstance.message = TranslationUtils.getTranslatedText(msg, this.translateService);
        if (accept != null) modalRef.componentInstance.accept = accept;
        return modalRef.result;
    }

}