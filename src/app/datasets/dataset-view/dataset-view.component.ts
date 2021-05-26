import { Component } from '@angular/core';
import { Project } from 'src/app/models/Project';
import { SVContext } from 'src/app/utils/SVContext';

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
        this.project = SVContext.getWorkingProject();
    }

}
