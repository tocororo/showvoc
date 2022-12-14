import { Component, ElementRef, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LinksetMetadata } from 'src/app/models/Metadata';
import { UIUtils } from 'src/app/utils/UIUtils';
import { Project } from '../../models/Project';

@Component({
    selector: 'alignments-modal',
    templateUrl: './alignments-modal.html'
})
export class AlignmentsModal {

    @Input() sourceProject: Project;
    @Input() linkset: LinksetMetadata;

    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) { }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    ok() {
        this.activeModal.close();
    }

    close() {
        this.activeModal.dismiss();
    }

}