import { Component } from '@angular/core';
import { AbstractTree } from '../abstract-tree';
import { TreeServices } from '../tree-services';
import { RDFResourceRolesEnum } from 'src/app/models/Resources';

@Component({
	selector: 'property-tree',
	templateUrl: './property-tree.component.html',
	styleUrls: ['../../data-structure.css'],
})
export class PropertyTreeComponent extends AbstractTree {

	constructor() {
		super();
	}

    initImpl() {
        this.loading = true;
		let getRootsImpl = TreeServices.getRootsImpl(RDFResourceRolesEnum.property);
		getRootsImpl().subscribe(nodes => {
			this.loading = false;
			this.nodes = nodes;
		});
    }

}
