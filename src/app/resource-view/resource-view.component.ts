import { Component, Input, OnInit } from '@angular/core';
import { AnnotatedValue, Resource } from '../models/Resources';

@Component({
	selector: 'resource-view',
	templateUrl: './resource-view.component.html',
})
export class ResourceViewComponent implements OnInit {

	@Input() resource: AnnotatedValue<Resource>;

	constructor() { }

	ngOnInit() {
	}

}
