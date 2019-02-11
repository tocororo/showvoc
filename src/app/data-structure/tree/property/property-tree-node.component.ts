import { Component } from '@angular/core';
import { RDFResourceRolesEnum } from 'src/app/models/Resources';
import { AbstractTreeNode } from '../abstract-tree-node';
import { TreeServices } from '../tree-services';

@Component({
	selector: 'property-tree-node',
	templateUrl: './property-tree-node.component.html',
	styleUrls: ['../../data-structure.css']
})
export class PropertyTreeNodeComponent extends AbstractTreeNode {

	constructor() {
		super()
	}

    /**
     * Implementation of the expansion. It calls the  service for getting the child of a node in the given tree
     */
    expandNodeImpl() {
        let expangNode = TreeServices.getExpandNodeImpl(this.node, RDFResourceRolesEnum.property);
        return expangNode(this.node);
    };

}
