import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'home-component',
	templateUrl: './home.component.html',
	host: { class: "pageComponent" }
})
export class HomeComponent implements OnInit {

	instanceName: string;

	constructor() { }

	ngOnInit() {
		this.instanceName = window['pmki_instance_name'];
	}

}
