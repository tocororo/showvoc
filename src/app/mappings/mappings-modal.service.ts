import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/modal-dialogs/Modals';
import { MappingsModal } from './mappings-modal';
import { Project } from '../models/Project';

@Injectable()
export class MappingsModalsServices {

    constructor(private modalService: NgbModal) { }

    openMappings(sourceProject: Project, targetProject: Project) {
    	const modalRef: NgbModalRef = this.modalService.open(MappingsModal, new ModalOptions("lg"));
        modalRef.componentInstance.sourceProject = sourceProject;
        modalRef.componentInstance.targetProject = targetProject;
        return modalRef.result;
    }


}