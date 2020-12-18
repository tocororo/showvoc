import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AnnotatedValue, Resource } from 'src/app/models/Resources';
import { ModalOptions, ModalType, TextOrTranslation } from '../Modals';
import { AlertModal } from './alert-modal/alert-modal';
import { ConfirmCheckModal, ConfirmCheckOptions } from './confirm-modal/confirm-check-modal';
import { ConfirmModal } from './confirm-modal/confirm-modal';
import { DownloadModal } from './download-modal/download-modal';
import { PromptModal } from './prompt-modal/prompt-modal';
import { PromptNumberModal } from './prompt-modal/prompt-number-modal';
import { ResourceSelectionModal } from './selection-modal/resource-selection-modal';

@Injectable()
export class BasicModalsServices {

    constructor(private modalService: NgbModal, private translateService: TranslateService) { }

    /**
     * @param title 
     * @param msg
     * @param type if provided, the message will be put in an proper-styled alert
     * @param details if provided, the alert will contain an expandable section with further details
     * @param checkboxLabel if provided, the alert will contain a checkbox with the given label
     * @param options 
     */
    alert(title: TextOrTranslation, msg: TextOrTranslation, type?: ModalType, details?: string, checkboxLabel?: string, options?: ModalOptions): Promise<boolean> {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(AlertModal, _options);
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.message = (typeof msg == "string") ? msg : this.translateService.instant(msg.key, msg.params);
        modalRef.componentInstance.type = type;
        modalRef.componentInstance.details = details;
        modalRef.componentInstance.checkboxLabel = checkboxLabel;
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
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.message = (typeof msg == "string") ? msg : this.translateService.instant(msg.key, msg.params);
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
    confirmCheck(title: TextOrTranslation, msg: TextOrTranslation, checkOpts: ConfirmCheckOptions[], type?: ModalType, options?: ModalOptions) {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(ConfirmCheckModal, _options);
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.message = (typeof msg == "string") ? msg : this.translateService.instant(msg.key, msg.params);
        modalRef.componentInstance.checkOpts = checkOpts;
        modalRef.componentInstance.type = type;
        return modalRef.result;
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
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.label = label;
        if (msg != null) {
            modalRef.componentInstance.message = (typeof msg == "string") ? msg : this.translateService.instant(msg.key, msg.params);
        }
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
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.message = (typeof msg == "string") ? msg : this.translateService.instant(msg.key, msg.params);
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
     * @param message the message to show in the modal dialog body. If null no message will be in the modal
     * @param resourceList array of available resources
     * @param rendering in case of array of resources, it tells whether the resources should be rendered
     * @return if the modal closes with ok returns a promise containing the selected resource
     */
    selectResource(title: TextOrTranslation, msg: TextOrTranslation, resourceList: AnnotatedValue<Resource>[], rendering?: boolean, options?: ModalOptions): Promise<AnnotatedValue<Resource>> {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(ResourceSelectionModal, _options);
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.message = (typeof msg == "string") ? msg : this.translateService.instant(msg.key, msg.params);
        modalRef.componentInstance.resourceList = resourceList;
        modalRef.componentInstance.rendering = rendering;
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
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.message = (typeof msg == "string") ? msg : this.translateService.instant(msg.key, msg.params);
        modalRef.componentInstance.downloadLink = downloadLink;
        modalRef.componentInstance.fileName = fileName;
        return modalRef.result;
    }

}