import { Component, OnInit } from '@angular/core';
import { SVContext } from '../utils/SVContext';

@Component({
	selector: 'home-component',
	templateUrl: './home.component.html',
	host: { class: "pageComponent" }
})
export class HomeComponent implements OnInit {

	instanceName: string;

	showContribution: boolean;

	translationParam: { instanceName: string }

	constructor() { }

	ngOnInit() {
		this.instanceName = window['showvoc_instance_name'];
		this.translationParam = { instanceName: this.instanceName };
		this.showContribution = !SVContext.getSystemSettings().disableContributions;
	}

}
