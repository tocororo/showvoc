import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { SkosServices } from 'src/app/services/skos.service';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractTreeNode } from '../abstract-tree-node';

@Component({
	selector: 'collection-tree-node',
	templateUrl: './collection-tree-node.component.html',
})
export class CollectionTreeNodeComponent extends AbstractTreeNode {

	constructor(private skosService: SkosServices) {
		super()
	}

    /**
     * Implementation of the expansion. It calls the  service for getting the child of a node in the given tree
     */
    expandNodeImpl() {
        return this.skosService.getNestedCollections(this.node.getValue()).pipe(
            map(collections => {
                let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
				ResourceUtils.sortResources(collections, orderAttribute);
				return collections;
            })
        );
    };

}
