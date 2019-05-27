import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnnotatedValue, IRI, Resource } from 'src/app/models/Resources';
import { StructureTabsetComponent } from 'src/app/structures/structure-tabset/structure-tabset.component';
import { ResourcesServices } from 'src/app/services/resources.service';

@Component({
    selector: 'dataset-data-component',
    templateUrl: './dataset-data.component.html',
    host: { class: "pageComponent" }
})
export class DatasetDataComponent implements OnInit {

    @ViewChild(StructureTabsetComponent) viewChildStructureTabset: StructureTabsetComponent;

    resource: AnnotatedValue<IRI> = null;

    constructor(private route: ActivatedRoute, private resourcesService: ResourcesServices) { }

    ngOnInit() {
        this.route.queryParams.subscribe(
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
        this.resource = node;
    }

    private objectDblClick(object: AnnotatedValue<Resource>) {
        this.viewChildStructureTabset.selectResource(object);
    }

}
