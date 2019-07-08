import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { delay, finalize } from 'rxjs/operators';
import { BasicModalsServices } from '../../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../../modal-dialogs/Modals';
import { Project } from '../../models/Project';
import { IRI } from '../../models/Resources';
import { AlignmentContext } from 'src/app/models/Alignments';

@Component({
	selector: 'alignments-modal',
	templateUrl: './alignments-modal.html'
})
export class AlignmentsModal {

    @Input() sourceProject: Project;
    @Input() targetProject: Project;

    alignmentCtx: AlignmentContext = AlignmentContext.global;

    constructor(public activeModal: NgbActiveModal, private basicModals: BasicModalsServices, private router: Router) { }
    
    onNavigate() {
        this.close();
    }

	// ngOnInit() {
    //     this.loading = true;
    //     this.getAlignmentListMockup().pipe(
    //         finalize(() => this.loading = false)
    //     ).subscribe(
    //         alignments => {
    //             this.alignments = alignments;
    //         }
    //     );
    // }

    // private getAlignmentListMockup(): Observable<Alignment[]> {
    //     let alignmentsMockup: Alignment[] = [];
    //     let maxAlignments: number = Math.random() * 50;
    //     for (let i = 0; i < maxAlignments; i++) {
    //         let sourceNs: string = this.sourceProject.getBaseURI();
    //         if (!sourceNs.endsWith("#") && !sourceNs.endsWith("/")) {
    //             sourceNs += "#";
    //         }

    //         let targetNs: string = this.targetProject.getBaseURI();
    //         if (!targetNs.endsWith("#") && !targetNs.endsWith("/")) {
    //             targetNs += "#";
    //         }

    //         alignmentsMockup.push({ sourceResource: new IRI(sourceNs + "c_" + i), targetResource: new IRI(targetNs + "c_" + i) });
    //     }
    //     return of(alignmentsMockup).pipe(delay(500));
    // }

    // openSourceResource(resource: IRI) {
    //     this.basicModals.confirm("Alignments", "Attention, you're going to leave this page. Do you want to continue?", ModalType.warning).then(
    //         confirm => {
    //             this.router.navigate(["/datasets/" + this.sourceProject.getName()], { queryParams: { resId: resource.getIRI() } });
    //             this.close();
    //         },
    //         cancel => {}
    //     );
    //     // HttpServiceContext.setContextProject(this.sourceProject);
    //     // this.sharedModals.openResourceView(resource).then(
    //     //     () => {
    //     //         HttpServiceContext.removeContextProject();
    //     //     }
    //     // );
    // }

    // openTargetResource(resource: IRI) {
    //     this.basicModals.confirm("Alignments", "Attention, you're going to leave this page. Do you want to continue?", ModalType.warning).then(
    //         confirm => {
    //             this.router.navigate(["/datasets/" + this.targetProject.getName()], { queryParams: { resId: resource.getIRI() } });
    //             this.close();
    //         },
    //         cancel => {}
    //     );
    // }

	ok() {
		this.activeModal.close();
	}

	close() {
		this.activeModal.dismiss();
	}

}


// class Alignment { 
//     sourceResource: IRI;
//     targetResource: IRI;
// }