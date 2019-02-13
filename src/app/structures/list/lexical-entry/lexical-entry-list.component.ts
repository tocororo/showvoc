import { Component } from '@angular/core';
import { AbstractList } from '../abstract-list';
import { TreeServices } from '../../tree/tree-services';
import { RDFResourceRolesEnum } from 'src/app/models/Resources';

@Component({
	selector: 'lexical-entry-list',
	templateUrl: './lexical-entry-list.component.html',
	styleUrls: ['../../structures.css']
})
export class LexicalEntryListComponent extends AbstractList {


    constructor() {
		super();
    }

    initImpl() {
        this.loading = true;
		let getNodesImpl = TreeServices.getNodesImpl(RDFResourceRolesEnum.ontolexLexicalEntry);
		getNodesImpl().subscribe(nodes => {
			this.loading = false;
			this.nodes = nodes;
		});
    }


}
