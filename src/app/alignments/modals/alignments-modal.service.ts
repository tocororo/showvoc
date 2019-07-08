import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/modal-dialogs/Modals';
import { AlignmentsModal } from './alignments-modal';
import { Project } from '../../models/Project';

@Injectable()
export class AlignmentsModalsServices {

    constructor(private modalService: NgbModal) { }

    openAlignments(sourceProject: Project, targetProject: Project) {
    	const modalRef: NgbModalRef = this.modalService.open(AlignmentsModal, new ModalOptions("lg"));
        modalRef.componentInstance.sourceProject = sourceProject;
        modalRef.componentInstance.targetProject = targetProject;
        return modalRef.result;
    }


}