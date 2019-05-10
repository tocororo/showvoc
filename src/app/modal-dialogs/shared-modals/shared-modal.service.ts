import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Resource } from 'src/app/models/Resources';
import { ModalOptions } from '../Modals';
import { ResourceViewModal } from './resource-view-modal/resource-view-modal';

@Injectable()
export class SharedModalsServices {

    constructor(private modalService: NgbModal) { }

	/**
     * Opens a resource view in a modal
     * @param resource 
     */
    openResourceView(resource: Resource, options?: ModalOptions) {
        let _options: ModalOptions = new ModalOptions("lg").merge(options);
		const modalRef: NgbModalRef = this.modalService.open(ResourceViewModal, _options );
        modalRef.componentInstance.resource = resource;
        return modalRef.result;
    }


}