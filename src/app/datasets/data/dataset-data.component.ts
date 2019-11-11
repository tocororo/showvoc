import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlignmentContext } from 'src/app/models/Alignments';
import { LinksetMetadata } from 'src/app/models/Metadata';
import { AnnotatedValue, IRI, Resource } from 'src/app/models/Resources';
import { ResourcesServices } from 'src/app/services/resources.service';
import { StructureTabsetComponent } from 'src/app/structures/structure-tabset/structure-tabset.component';

@Component({
    selector: 'dataset-data-component',
    templateUrl: './dataset-data.component.html',
    host: { class: "pageComponent" }
})
export class DatasetDataComponent implements OnInit {

    @ViewChild(StructureTabsetComponent) viewChildStructureTabset: StructureTabsetComponent;

    selectedResource: AnnotatedValue<IRI> = null;
    selectedLinkset: LinksetMetadata;
    alignmentCtx: AlignmentContext = AlignmentContext.local;

    constructor(private activatedRoute: ActivatedRoute, private router: Router, private resourcesService: ResourcesServices) { }

    ngOnInit() {
        // let resId: string = this.activatedRoute.snapshot.queryParamMap.get("resId");
        // if (resId != null) {
        //     this.resourcesService.getResourceDescription(new IRI(resId)).subscribe(
        //         (annotatedRes: AnnotatedValue<IRI>) => {
        //             this.viewChildStructureTabset.selectResource(annotatedRes);
        //         }
        //     );
        // }

        /**
         * The above was executed only when the page is initialized, while the following is executed each time the resId param changes
         */
        this.activatedRoute.queryParams.subscribe(
            params => {
                let resId: string = params['resId'];
                if (resId != null) {
                    this.resourcesService.getResourceDescription(new IRI(resId)).subscribe(
                        (annotatedRes: AnnotatedValue<IRI>) => {
                            this.viewChildStructureTabset.selectResource(annotatedRes);
                        }
                    );
                }
            }
        );

    }

    onNodeSelected(node: AnnotatedValue<IRI>) {
        if (node == null) return;
        this.selectedResource = node;
        this.selectedLinkset = null;
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

    onLinksetSelected(linkset: LinksetMetadata) {
        this.selectedLinkset = linkset;
        this.selectedResource = null;
        //update the url removing the query parameters eventually set by the selected node
        this.router.navigate([], { 
            relativeTo: this.activatedRoute, 
            replaceUrl: true,
        });
    }

}
