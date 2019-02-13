import { Component } from '@angular/core';
import { RDFResourceRolesEnum } from 'src/app/models/Resources';
import { AbstractTree } from '../abstract-tree';
import { TreeServices } from '../tree-services';

@Component({
	selector: 'collection-tree',
	templateUrl: './collection-tree.component.html',
	styleUrls: ['../../structures.css'],
})
export class CollectionTreeComponent extends AbstractTree {

	constructor() {
		super();
	}

    initImpl() {
        this.loading = true;
		let getRootsImpl = TreeServices.getRootsImpl(RDFResourceRolesEnum.skosCollection);
		getRootsImpl().subscribe(nodes => {
			this.loading = false;
			this.nodes = nodes;
		});
    }

}
