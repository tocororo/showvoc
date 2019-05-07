import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AnnotatedValue, Resource } from 'src/app/models/Resources';
import { ModalOptions, ModalType } from '../Modals';
import { AlertModal } from './alert-modal/alert-modal';
import { ConfirmModal } from './confirm-modal/confirm-modal';
import { ResourceSelectionModal } from './selection-modal/resource-selection-modal';

@Injectable()
export class BasicModalsServices {

    constructor(private modalService: NgbModal) { }

	/**
	 * 
	 * @param title 
	 * @param message 
	 * @param type if provided, the message will be put in an proper-styled alert
	 * @param options 
	 */
    alert(title: string, message: string, type?: ModalType, details?: string, options?: ModalOptions) {
		let _options: ModalOptions = new ModalOptions().merge(options);
		const modalRef: NgbModalRef = this.modalService.open(AlertModal, _options );
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.message = message;
		modalRef.componentInstance.type = type;
		modalRef.componentInstance.details = details;
        return modalRef.result;
    }

    confirm(title: string, message: string, type?: ModalType, options?: ModalOptions) {
		let _options: ModalOptions = new ModalOptions().merge(options);
		const modalRef: NgbModalRef = this.modalService.open(ConfirmModal, _options );
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.message = message;
		modalRef.componentInstance.type = type;
        return modalRef.result;
    }

    selectResource(title: string, message: string, resourceList: AnnotatedValue<Resource>[], rendering?: boolean, options?: ModalOptions) {
        let _options: ModalOptions = new ModalOptions().merge(options);
		const modalRef: NgbModalRef = this.modalService.open(ResourceSelectionModal, _options );
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.message = message;
		modalRef.componentInstance.resourceList = resourceList;
		modalRef.componentInstance.rendering = rendering;
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