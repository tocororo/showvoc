import { Component, OnInit } from '@angular/core';
import { Project } from 'src/app/models/Project';
import { PMKIContext } from 'src/app/utils/PMKIContext';

@Component({
	selector: 'dataset-view',
	templateUrl: './dataset-view.component.html',
	host: { class: "pageComponent" }
})
export class DatasetViewComponent implements OnInit {

    project: Project;

	constructor() { }

	ngOnInit() {
        this.project = PMKIContext.getProject();
	}

}
