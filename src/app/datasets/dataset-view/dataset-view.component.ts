import { Component } from '@angular/core';
import { PMKIContext } from 'src/app/utils/PMKIContext';
import { Project } from 'src/app/models/Project';

@Component({
    selector: 'dataset-view',
    templateUrl: './dataset-view.component.html',
    host: { class: "pageComponent" },
    styles: [`
		.nav-pills .nav-link.active { background-color: #17a2b8; }
		a { color: #17a2b8; }
	`]
})
export class DatasetViewComponent {

    project: Project;

    constructor() { }

    ngOnInit() {
        this.project = PMKIContext.getProject();
    }

}
