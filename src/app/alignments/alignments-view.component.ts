import { Component, Input, SimpleChanges } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { SharedModalsServices } from '../modal-dialogs/shared-modals/shared-modal.service';
import { AlignmentContext } from '../models/Alignments';
import { LinksetMetadata } from '../models/Metadata';
import { Project } from '../models/Project';
import { AnnotatedValue, IRI, Triple } from '../models/Resources';
import { AlignmentServices } from '../services/alignment.service';
import { ResourcesServices } from '../services/resources.service';
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

    loading: boolean = false;
    annotatedMappings: Triple<AnnotatedValue<IRI>>[];

    //pagination
    private page: number = 0;
    private totPage: number;
    private pageSize: number = 50;

    constructor(private alignmentService: AlignmentServices, private resourcesService: ResourcesServices, private sharedModals: SharedModalsServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['linkset']) {
            this.initAlignments();
        }
    }

    initAlignments() {
        if (this.context == AlignmentContext.local) {
            this.sourceProject = PMKIContext.getProjectCtx().getProject();
        }

        PMKIContext.setTempProject(this.sourceProject);
        this.alignmentService.getMappingCount(this.linkset.targetDataset.uriSpace, null, null, this.pageSize).subscribe(
            count => {
                PMKIContext.removeTempProject();
                this.totPage = Math.floor(count/this.pageSize);
                if (count % this.pageSize > 0) {
                    this.totPage++;
                }
                this.listMappings();
            }
        );
    }

    private listMappings() {
        this.loading = true;
        PMKIContext.setTempProject(this.sourceProject);
        this.alignmentService.getMappings(this.linkset.targetDataset.uriSpace, this.page, this.pageSize).pipe(
            finalize(() => {
                this.loading = false;
                PMKIContext.removeTempProject();
            })
        ).subscribe(
            mappings => {
                this.annotatedMappings = [];
                mappings.forEach(m => {
                    this.annotatedMappings.push(new Triple(new AnnotatedValue(m.getLeft()), new AnnotatedValue(m.getMiddle()), new AnnotatedValue(m.getRight())));
                });
                this.annotateMappingResources();
            }
        );
    }

    private annotateMappingResources() {
        let leftEntities: IRI[] = [];
        let rightEntities: IRI[] = [];
        this.annotatedMappings.forEach(m => {
            leftEntities.push(m.getLeft().getValue());
            rightEntities.push(m.getRight().getValue());
        });
        let annotateFunctions: Observable<void>[] = [];
        if (leftEntities.length > 0) {
            PMKIContext.setTempProject(this.sourceProject);
            let annotateLeft: Observable<void> = this.resourcesService.getResourcesInfo(leftEntities).pipe(
                finalize(() => {
                    PMKIContext.removeTempProject();
                }),
                map(annotated => {
                    annotated.forEach(a => {
                        this.annotatedMappings.forEach(mapping => {
                            if (mapping.getLeft().getValue().equals(a.getValue())) {
                                mapping.setLeft(a);
                            }
                        })
                        a.getValue().equals
                    })
                })
            );
            annotateFunctions.push(annotateLeft);
        }

        if (rightEntities.length > 0 && this.linkset.getTargetProject() != null) {
            let ctxProject: Project = this.linkset.getTargetProject();
            PMKIContext.setTempProject(ctxProject);
            let annotateRight: Observable<void> = this.resourcesService.getResourcesInfo(rightEntities).pipe(
                finalize(() => {
                    PMKIContext.removeTempProject();
                }),
                map(annotated => {
                    annotated.forEach(a => {
                        this.annotatedMappings.forEach(mapping => {
                            if (mapping.getRight().getValue().equals(a.getValue())) {
                                mapping.setRight(a);
                            }
                        })
                        a.getValue().equals
                    })
                })
            );
            annotateFunctions.push(annotateRight);
        }
        forkJoin(...annotateFunctions).subscribe();
    }

    openSourceResource(resource: AnnotatedValue<IRI>) {
        if (this.context == AlignmentContext.local) {
            this.sharedModals.openResourceView(resource.getValue());
        } else { //global
            PMKIContext.setTempProject(this.sourceProject);
            this.sharedModals.openResourceView(resource.getValue(), new ProjectContext(this.sourceProject)).then(
                () => {
                    PMKIContext.removeTempProject();
                }
            );
        }
    }

    openTargetResource(resource: AnnotatedValue<IRI>) {
        let ctxProject: Project = this.sourceProject; //by default use the source project as ctx project
        if (this.linkset.targetDataset.projectName != null) { //if target project is known, set it as context project
            ctxProject = new Project(this.linkset.targetDataset.projectName);
        }
        PMKIContext.setTempProject(ctxProject);
        this.sharedModals.openResourceView(resource.getValue(), new ProjectContext(ctxProject)).then(
            () => {
                PMKIContext.removeTempProject();
            }
        );
    }

    /**
     * Paging
     */

    private prevPage() {
        this.page--;
        this.listMappings();
    }

    private nextPage() {
        this.page++;
        this.listMappings();
    }

}