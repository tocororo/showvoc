import { Component, Input, SimpleChanges } from '@angular/core';
import { concat, forkJoin, Observable } from 'rxjs';
import { finalize, map, toArray } from 'rxjs/operators';
import { SharedModalsServices } from '../modal-dialogs/shared-modals/shared-modal.service';
import { LinksetMetadata } from '../models/Metadata';
import { Project } from '../models/Project';
import { AnnotatedValue, IRI, Triple } from '../models/Resources';
import { AlignmentServices } from '../services/alignment.service';
import { ResourcesServices } from '../services/resources.service';
import { HttpServiceContext } from '../utils/HttpManager';
import { ProjectContext, SVContext } from '../utils/SVContext';
import { SVProperties } from '../utils/SVProperties';

@Component({
    selector: 'alignments-view',
    templateUrl: './alignments-view.component.html',
    host: { class: "vbox" }
})
export class AlignmentsView {

    @Input() sourceProject: Project; //source project of the alignment, if not provided it is taken from the SVContext
    @Input() linkset: LinksetMetadata;

    sourceCtx: ProjectContext;
    targetCtx: ProjectContext;

    loading: boolean = false;
    annotatedMappings: Triple<AnnotatedValue<IRI>>[];

    //pagination
    page: number = 0;
    totPage: number;
    pageSize: number = 50;

    constructor(private alignmentService: AlignmentServices, private resourcesService: ResourcesServices, private svProps: SVProperties,
        private sharedModals: SharedModalsServices) { }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['linkset']) {
            this.initAlignments();
        }
    }

    initAlignments() {
        if (this.sourceProject == null) { //get the current project if no source project is provided
            this.sourceProject = SVContext.getProjectCtx().getProject();
        }

        /* init the two dataset context */
        //- source (context is taken from SVContext if the sourceProject is the currently accessed, otherwise is initialized)
        if (SVContext.getProjectCtx() != null && SVContext.getProjectCtx().getProject().getName() == this.sourceProject.getName()) {
            this.sourceCtx = SVContext.getProjectCtx();
        } else {
            //use a temp context, so bound sourceCtx only when its preferences are initialized (preventing error il alignment-searchbar that expects settings into the ctx)
            let tempCtx = new ProjectContext(this.sourceProject);
            this.svProps.initUserProjectPreferences(tempCtx).subscribe(
                () => {
                    this.sourceCtx = tempCtx;
                }
            );
        }
        //- target
        let targetProject: Project = this.linkset.getTargetProject();
        if (targetProject != null) { //this means that target resources belong to a project hosted on showvoc
            let tempCtx = new ProjectContext(targetProject);
            this.svProps.initUserProjectPreferences(tempCtx).subscribe(
                () => {
                    this.targetCtx = tempCtx;
                }
            );
        }

        SVContext.setTempProject(this.sourceProject);
        this.alignmentService.getMappingCount(this.linkset.targetDataset.uriSpace, null, null, this.pageSize).subscribe(
            count => {
                SVContext.removeTempProject();
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
        SVContext.setTempProject(this.sourceProject);
        this.alignmentService.getMappings(this.linkset.targetDataset.uriSpace, this.page, this.pageSize).pipe(
            finalize(() => {
                this.loading = false;
            })
        ).subscribe(
            mappings => {
                SVContext.removeTempProject();
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

        //annotate left
        if (leftEntities.length > 0) {
            HttpServiceContext.setContextProject(this.sourceProject);
            let annotateLeft: Observable<void> = this.resourcesService.getResourcesInfo(leftEntities).pipe(
                finalize(() => {
                    HttpServiceContext.resetContext();
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

        //annotate right (only if right project is available)
        if (rightEntities.length > 0 && this.targetCtx != null) {
            HttpServiceContext.setContextProject(this.targetCtx.getProject());
            let annotateRight: Observable<void> = this.resourcesService.getResourcesInfo(rightEntities).pipe(
                finalize(() => {
                    HttpServiceContext.resetContext();
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
        concat(...annotateFunctions).pipe(
            toArray()
        ).subscribe();
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
        let ctxProject: Project = this.sourceProject; //by default use the source project as ctx project
        if (this.linkset.getTargetProject() != null) { //if target project is known, set it as context project
            ctxProject = this.linkset.getTargetProject();
        }
        SVContext.setTempProject(ctxProject);
        this.sharedModals.openResourceView(resource.getValue(), new ProjectContext(ctxProject)).then(
            () => {
                SVContext.removeTempProject();
            }
        );
    }

    /* ==========================
     * Paging
     * ==========================*/

    prevPage() {
        this.page--;
        this.listMappings();
    }

    nextPage() {
        this.page++;
        this.listMappings();
    }

}