import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnotatedValue, IRI, Resource } from 'src/app/models/Resources';
import { ResourcesServices } from 'src/app/services/resources.service';
import { StructureTabsetComponent } from 'src/app/structures/structure-tabset/structure-tabset.component';
import { AlignmentOverview, AlignmentContext } from 'src/app/models/Alignments';

@Component({
    selector: 'dataset-data-component',
    templateUrl: './dataset-data.component.html',
    host: { class: "pageComponent" }
})
export class DatasetDataComponent implements OnInit {

    @ViewChild(StructureTabsetComponent) viewChildStructureTabset: StructureTabsetComponent;

    selectedResource: AnnotatedValue<IRI> = null;
    selectedAlignment: AlignmentOverview;
    alignmentCtx: AlignmentContext = AlignmentContext.local;

    constructor(private activatedRoute: ActivatedRoute, private router: Router, private resourcesService: ResourcesServices) { }

    ngOnInit() {
        this.activatedRoute.queryParams.subscribe(
            params => {
                let resId: string = params['resId'];
                if (resId != null) {
                    this.resourcesService.getResourceDescription(new IRI(resId)).subscribe(
                        (annotatedRes: AnnotatedValue<IRI>) => {
                            this.viewChildStructureTabset.selectResource(annotatedRes);
                        }
                    )

                }
            }
        );
    }

    onNodeSelected(node: AnnotatedValue<IRI>) {
        if (node == null) return;
        this.selectedResource = node;
        this.selectedAlignment = null;
        //update the url with the current selected resource IRI as resId parameter
        this.router.navigate([], { 
            relativeTo: this.activatedRoute, 
            queryParams: { resId: node.getValue().getIRI() },
            replaceUrl: true,
        });
    }

    private objectDblClick(object: AnnotatedValue<Resource>) {
        this.viewChildStructureTabset.selectResource(object);
    }

    onAlignmentSelected(alignment: AlignmentOverview) {
        this.selectedAlignment = alignment;
        this.selectedResource = null;
        //update the url removing the query parameters eventually set by the selected node
        this.router.navigate([], { 
            relativeTo: this.activatedRoute, 
            replaceUrl: true,
        });
    }

}
