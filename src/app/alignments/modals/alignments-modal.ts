import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlignmentContext } from 'src/app/models/Alignments';
import { Project } from '../../models/Project';
import { LinksetMetadata } from 'src/app/models/Metadata';

@Component({
	selector: 'alignments-modal',
	templateUrl: './alignments-modal.html'
})
export class AlignmentsModal {

    @Input() sourceProject: Project;
    @Input() linkset: LinksetMetadata;

    alignmentCtx: AlignmentContext = AlignmentContext.global;

    constructor(public activeModal: NgbActiveModal) { }
    
    onNavigate() {
        this.close();
    }

	ok() {
		this.activeModal.close();
	}

	close() {
		this.activeModal.dismiss();
	}

}