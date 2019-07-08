import { Component, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, finalize } from 'rxjs/operators';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { AlignmentContext } from '../models/Alignments';
import { Project } from '../models/Project';
import { IRI } from '../models/Resources';
import { PMKIContext } from '../utils/PMKIContext';

@Component({
	selector: 'alignments-view',
    templateUrl: './alignments-view.component.html',
    host: { class: "vbox" }
})
export class AlignmentsView {

    @Input() context: AlignmentContext;
	@Input() sourceProject: Project;
    @Input() targetProject: Project;

    //used if this view is in global context, so after the navigation the modal (contining this view) should be closed
    @Output() navigate: EventEmitter<any> = new EventEmitter(); 

    loading: boolean = false;
    alignments: Alignment[];

    constructor(private basicModals: BasicModalsServices, private router: Router) { }

	ngOnChanges(changes: SimpleChanges) {
        if (changes['sourceProject'] || changes['targetProject']) {
            this.initAlignments();
        }
    }

    initAlignments() {
        this.loading = true;
        this.alignments = null;

        this.getAlignmentListMockup().pipe(
            finalize(() => this.loading = false)
        ).subscribe(
            alignments => {
                this.alignments = alignments;
            }
        );
    }

    private getAlignmentListMockup(): Observable<Alignment[]> {

        if (this.context == AlignmentContext.local) {
            this.sourceProject = PMKIContext.getProjectCtx().getProject();
        }

        let alignmentsMockup: Alignment[] = [];
        let maxAlignments: number = Math.random() * 50;
        for (let i = 0; i < maxAlignments; i++) {
            let sourceNs: string = this.sourceProject.getBaseURI();
            if (!sourceNs.endsWith("#") && !sourceNs.endsWith("/")) {
                sourceNs += "#";
            }

            let targetNs: string = this.targetProject.getBaseURI();
            if (!targetNs.endsWith("#") && !targetNs.endsWith("/")) {
                targetNs += "#";
            }

            alignmentsMockup.push({ sourceResource: new IRI(sourceNs + "c_" + i), targetResource: new IRI(targetNs + "c_" + i) });
        }
        return of(alignmentsMockup).pipe(delay(500));
    }

    openSourceResource(resource: IRI) {
        if (this.context == AlignmentContext.global) {
            this.basicModals.confirm("Alignments", "Attention, you're going to leave this page. Do you want to continue?", ModalType.warning).then(
                confirm => {
                    this.navigateToResource(this.sourceProject, resource);
                },
                cancel => {}
            );
        } else {
            this.navigateToResource(this.sourceProject, resource);
        }
    }

    openTargetResource(resource: IRI) {
        let msg: string;
        if (this.context == AlignmentContext.global) {
            msg = "Attention, you're going to leave this page. Do you want to continue?";
        } else { //local
            msg = "Attention, the resource you selected belongs to a project different from the currently open, " + 
                "so you're going to change the working project. Do you want to continue?"
        }
        this.basicModals.confirm("Alignments", msg, ModalType.warning).then(
            confirm => {
                this.navigateToResource(this.targetProject, resource);
            },
            cancel => {}
        );
    }

    private navigateToResource(project: Project, resource: IRI) {
        this.router.navigate(["/datasets/" + project.getName()], { queryParams: { resId: resource.getIRI() } });
        if (this.context == AlignmentContext.global) {
            this.navigate.emit();
        }
    }

}


class Alignment { 
    sourceResource: IRI;
    targetResource: IRI;
}