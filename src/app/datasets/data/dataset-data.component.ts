import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { StructureTabsetComponent } from 'src/app/structures/structure-tabset/structure-tabset.component';

@Component({
    selector: 'dataset-data-component',
    templateUrl: './dataset-data.component.html',
    host: { class: "pageComponent" }
})
export class DatasetDataComponent implements OnInit {

    @ViewChild(StructureTabsetComponent) viewChildStructureTabset: StructureTabsetComponent;

    resource: AnnotatedValue<IRI> = null;

    constructor(private route: ActivatedRoute) { }

    ngOnInit() {
        this.route.queryParams.subscribe(
            params => {
                let resId: string = params['resId'];
                if (resId != null) {
                    //give the time to initialize the structure tabset after the change of this.ready
                    setTimeout(() => {
                        this.viewChildStructureTabset.selectResource(new IRI(resId));
                    });

                }
            }
        );
    }

    onNodeSelected(node: AnnotatedValue<IRI>) {
        if (node == null) return;
        this.resource = node;
    }

}
