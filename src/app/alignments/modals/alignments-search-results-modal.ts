import { Component, ElementRef, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { Project } from 'src/app/models/Project';
import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { ProjectContext, SVContext } from 'src/app/utils/SVContext';
import { UIUtils } from 'src/app/utils/UIUtils';

@Component({
    selector: 'alignments-search-results-modal',
    templateUrl: './alignments-search-results-modal.html'
})
export class AlignmentsSearchResultsModal {

    @Input() sourceProject: Project;
    @Input() targetProject: Project;

    @Input() sourceResults: AnnotatedValue<IRI>[];
    @Input() targetResults: AnnotatedValue<IRI>[];

    constructor(public activeModal: NgbActiveModal, private sharedModals: SharedModalsServices, private elementRef: ElementRef) { }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    openSourceResource(resource: AnnotatedValue<IRI>) {
        SVContext.setTempProject(this.sourceProject);
        this.sharedModals.openResourceView(resource.getValue(), new ProjectContext(this.sourceProject)).then(
            () => {
                SVContext.removeTempProject();
            }
        );
    }

    openTargetResource(resource: AnnotatedValue<IRI>) {
        SVContext.setTempProject(this.targetProject); //target project is provided for sure if the target matches are available
        this.sharedModals.openResourceView(resource.getValue(), new ProjectContext(this.targetProject)).then(
            () => {
                SVContext.removeTempProject();
            }
        );
    }

    ok() {
        this.activeModal.close();
    }

    close() {
        this.activeModal.dismiss();
    }

}