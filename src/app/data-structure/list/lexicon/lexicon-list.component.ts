import { Component } from '@angular/core';
import { AbstractList } from '../abstract-list';
import { TreeServices } from '../../tree/tree-services';
import { RDFResourceRolesEnum } from 'src/app/models/Resources';

@Component({
	selector: 'lexicon-list',
	templateUrl: './lexicon-list.component.html',
	styleUrls: ['../../data-structure.css']
})
export class LexiconListComponent extends AbstractList {


    constructor() {
		super();
    }

    initImpl() {
        this.loading = true;
		let getNodesImpl = TreeServices.getNodesImpl(RDFResourceRolesEnum.limeLexicon);
		getNodesImpl().subscribe(nodes => {
			this.loading = false;
			this.nodes = nodes;
		});
    }


}
