import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { SharedModalsServices } from '../modal-dialogs/shared-modals/shared-modal.service';
import { AlignmentContext } from '../models/Alignments';
import { LinksetMetadata } from '../models/Metadata';
import { Project } from '../models/Project';
import { IRI, Triple } from '../models/Resources';
import { AlignmentServices } from '../services/alignment.service';
import { PMKIContext, ProjectContext } from '../utils/PMKIContext';

@Component({
    selector: 'alignments-view',
    templateUrl: './alignments-view.component.html',
    host: { class: "vbox" }
})
export class AlignmentsView {

    @Input() context: AlignmentContext;
    @Input() sourceProject: Project;
    @Input() linkset: LinksetMetadata;

    //used if this view is in global context, so after the navigation the modal (contining this view) should be closed
    @Output() navigate: EventEmitter<any> = new EventEmitter();

    loading: boolean = false;
    mappings: Triple<IRI>[];

    constructor(private alignmentService: AlignmentServices, private basicModals: BasicModalsServices, private sharedModals: SharedModalsServices,
        private router: Router) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['linkset']) {
            this.initAlignments();
        }
    }

    initAlignments() {
        this.loading = true;
        this.mappings = null;

        if (this.context == AlignmentContext.local) {
            this.sourceProject = PMKIContext.getProjectCtx().getProject();
        }

        PMKIContext.setTempProject(this.sourceProject);
        this.alignmentService.getMappings(this.linkset.targetDataset.uriSpace).pipe(
            finalize(() => {
                this.loading = false;
                PMKIContext.removeTempProject();
            })
        ).subscribe(
            mappings => {
                this.mappings = mappings;
            }
        );

    }

    openSourceResource(resource: IRI) {
        if (this.context == AlignmentContext.global) {
            this.basicModals.confirm("Alignments", "Attention, you're going to leave this page. Do you want to continue?", ModalType.warning).then(
                confirm => {
                    this.navigateToResource(this.sourceProject.getName(), resource);
                },
                cancel => { }
            );
        } else {
            this.navigateToResource(this.sourceProject.getName(), resource);
        }
    }

    openTargetResource(resource: IRI) {
        if (this.linkset.targetDataset.projectName != null) { //allow to leave the page and go to the data page only if the target project is recognize
            let msg: string;
            if (this.context == AlignmentContext.global) {
                msg = "Attention, you're going to leave this page. Do you want to continue?";
            } else { //local
                msg = "Attention, the resource you selected belongs to a project different from the currently open, " +
                    "so you're going to change the working project. Do you want to continue?"
            }
            this.basicModals.confirm("Alignments", msg, ModalType.warning).then(
                confirm => {
                    this.navigateToResource(this.linkset.targetDataset.projectName, resource);
                },
                cancel => { }
            );
        } else { //otherwise open the resource view as modal with the source project as ctx_project
            PMKIContext.setTempProject(this.sourceProject);
            this.sharedModals.openResourceView(resource, new ProjectContext(this.sourceProject)).then(
                () => {
                    PMKIContext.removeTempProject();
                }
            );
        }
    }

    private navigateToResource(projectName: string, resource: IRI) {
        this.router.navigate(["/datasets/" + projectName], { queryParams: { resId: resource.getIRI() } });
        if (this.context == AlignmentContext.global) {
            this.navigate.emit();
        }
    }

}