import { Component, QueryList, ViewChildren } from '@angular/core';
import { map } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { PropertiesServices } from 'src/app/services/properties.service';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractTreeNode } from '../abstract-tree-node';

@Component({
    selector: 'property-tree-node',
    templateUrl: './property-tree-node.component.html',
})
export class PropertyTreeNodeComponent extends AbstractTreeNode {

    @ViewChildren(PropertyTreeNodeComponent) viewChildrenNode: QueryList<PropertyTreeNodeComponent>;

    constructor(private propertiesService: PropertiesServices, basicModals: BasicModalsServices, sharedModals: SharedModalsServices) {
        super(basicModals, sharedModals);
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
