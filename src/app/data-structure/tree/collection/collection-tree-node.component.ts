import { Component } from '@angular/core';
import { RDFResourceRolesEnum } from 'src/app/models/Resources';
import { AbstractTreeNode } from '../abstract-tree-node';
import { TreeServices } from '../tree-services';

@Component({
	selector: 'collection-tree-node',
	templateUrl: './collection-tree-node.component.html',
	styleUrls: ['../../data-structure.css']
})
export class CollectionTreeNodeComponent extends AbstractTreeNode {

	constructor() {
		super()
	}

    /**
     * Implementation of the expansion. It calls the  service for getting the child of a node in the given tree
     */
    expandNodeImpl() {
        let expangNode = TreeServices.getExpandNodeImpl(this.node, RDFResourceRolesEnum.skosCollection);
        return expangNode(this.node);
    };

}
