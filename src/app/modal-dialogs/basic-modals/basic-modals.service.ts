import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AnnotatedValue, Resource } from 'src/app/models/Resources';
import { ModalOptions, ModalType } from '../Modals';
import { AlertModal } from './alert-modal/alert-modal';
import { ConfirmModal } from './confirm-modal/confirm-modal';
import { ResourceSelectionModal } from './selection-modal/resource-selection-modal';
import { DownloadModal } from './download-modal/download-modal';

@Injectable()
export class BasicModalsServices {

    constructor(private modalService: NgbModal) { }

    /**
     * @param title 
     * @param message 
     * @param type if provided, the message will be put in an proper-styled alert
     * @param details if provided, the alert will contain an expandable section with further details
     * @param checkboxLabel if provided, the alert will contain a checkbox with the given label
     * @param options 
     */
    alert(title: string, message: string, type?: ModalType, details?: string, checkboxLabel?: string, options?: ModalOptions): Promise<boolean> {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(AlertModal, _options);
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.message = message;
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
    confirm(title: string, message: string, type?: ModalType, options?: ModalOptions) {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(ConfirmModal, _options);
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.message = message;
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
    selectResource(title: string, message: string, resourceList: AnnotatedValue<Resource>[], rendering?: boolean, options?: ModalOptions): Promise<AnnotatedValue<Resource>> {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(ResourceSelectionModal, _options);
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.message = message;
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
    downloadLink(title: string, message: string, downloadLink: string, fileName: string, options?: ModalOptions) {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(DownloadModal, _options);
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.message = message;
        modalRef.componentInstance.downloadLink = downloadLink;
        modalRef.componentInstance.fileName = fileName;
        return modalRef.result;
    }

    // openSmallModal() {
    // 	const modalRef: NgbModalRef = this.modalService.open(AlertModalComponent, { backdrop: "static" , size: "sm" } );
    // 	modalRef.componentInstance.name = 'Tiziano';
    // 	modalRef.result.then(
    // 		result => { console.log("close", result); }, 
    // 		cancel => { console.log("dismiss", cancel); }
    // 	)
    // }


}