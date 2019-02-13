import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AlertModalComponent } from './alert-modal/alert-modal.component';
import { ModalType, ModalOptions } from '../Modals';

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
    alert(title: string, message: string, type?: ModalType, options?: ModalOptions) {
		let _options: ModalOptions = new ModalOptions().merge(options);
		const modalRef: NgbModalRef = this.modalService.open(AlertModalComponent, _options );
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.message = message;
        modalRef.componentInstance.type = type;
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