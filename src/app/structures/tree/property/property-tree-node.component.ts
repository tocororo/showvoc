import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { PropertiesServices } from 'src/app/services/properties.service';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractTreeNode } from '../abstract-tree-node';

@Component({
	selector: 'property-tree-node',
	templateUrl: './property-tree-node.component.html',
})
export class PropertyTreeNodeComponent extends AbstractTreeNode {

	constructor(private propertiesService: PropertiesServices) {
		super()
	}

    /**
     * Implementation of the expansion. It calls the  service for getting the child of a node in the given tree
     */
    expandNodeImpl() {
        return this.propertiesService.getSubProperties(this.node.getValue()).pipe(
            map(properties => {
                let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
				ResourceUtils.sortResources(properties, orderAttribute);
				return properties;
            })
        );
    };

}
