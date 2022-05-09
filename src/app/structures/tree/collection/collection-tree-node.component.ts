import { Component, QueryList, ViewChildren } from '@angular/core';
import { map } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { SkosServices } from 'src/app/services/skos.service';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractTreeNode } from '../abstract-tree-node';

@Component({
    selector: 'collection-tree-node',
    templateUrl: './collection-tree-node.component.html',
})
export class CollectionTreeNodeComponent extends AbstractTreeNode {

    @ViewChildren(CollectionTreeNodeComponent) viewChildrenNode: QueryList<CollectionTreeNodeComponent>;

    constructor(private skosService: SkosServices, basicModals: BasicModalsServices, sharedModals: SharedModalsServices) {
        super(basicModals, sharedModals);
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
    }

}
