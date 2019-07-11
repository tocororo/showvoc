import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/modal-dialogs/Modals';
import { AlignmentsModal } from './alignments-modal';
import { Project } from '../../models/Project';
import { LinksetMetadata } from 'src/app/models/Metadata';

@Injectable()
export class AlignmentsModalsServices {

    constructor(private modalService: NgbModal) { }

    openAlignments(sourceProject: Project, linkset: LinksetMetadata) {
    	const modalRef: NgbModalRef = this.modalService.open(AlignmentsModal, new ModalOptions("lg"));
        modalRef.componentInstance.sourceProject = sourceProject;
        modalRef.componentInstance.linkset = linkset;
        return modalRef.result;
    }


}