import { Component, OnInit } from '@angular/core';
import { AbstractNode } from '../abstract-node';

@Component({
	selector: 'list-node',
	templateUrl: './list-node.component.html',
	styleUrls: ['../data-structure.css']
})
export class ListNodeComponent extends AbstractNode implements OnInit {

	constructor() {
		super()
	}

	ngOnInit() {
	}

}
