import { Component } from '@angular/core';
import { RDFResourceRolesEnum } from 'src/app/models/Resources';
import { AbstractTreeNode } from '../abstract-tree-node';
import { TreeServices } from '../tree-services';

@Component({
	selector: 'concept-tree-node',
	templateUrl: './concept-tree-node.component.html',
	styleUrls: ['../../structures.css']
})
export class ConceptTreeNodeComponent extends AbstractTreeNode {

	constructor() {
		super()
	}

    /**
     * Implementation of the expansion. It calls the  service for getting the child of a node in the given tree
     */
    expandNodeImpl() {
        let expangNode = TreeServices.getExpandNodeImpl(this.node, RDFResourceRolesEnum.concept);
        return expangNode(this.node);
    };

}
