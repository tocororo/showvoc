import { Location } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LinksetMetadata } from 'src/app/models/Metadata';
import { AnnotatedValue, IRI, Resource } from 'src/app/models/Resources';
import { ShowVocUrlParams } from 'src/app/models/ShowVoc';
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

    constructor(private activatedRoute: ActivatedRoute, private router: Router, private location: Location, private resourcesService: ResourcesServices) { }

    ngOnInit() {
        /**
         * The subscription to queryParams is MANDATORY in order to trigger the handler each time the resId param changes
         * (not only at the first initialization of the component)
         */
        this.activatedRoute.queryParams.subscribe(
            params => {
                let resId: string = params[ShowVocUrlParams.resId];
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
        /* 
         * Update the url with the current selected resource IRI as resId parameter
         * Note: here it uses location.go() instead of router.navigate() in order to avoid to trigger the change detection to queryParams
         * (see code in ngOnInit())
         */
        const urlTree = this.router.createUrlTree([], {
            queryParams: { [ShowVocUrlParams.resId]: node.getValue().getIRI() },
            queryParamsHandling: 'merge',
            preserveFragment: true 
        });
        this.location.go(urlTree.toString());
    }

    objectDblClick(object: AnnotatedValue<Resource>) {
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
