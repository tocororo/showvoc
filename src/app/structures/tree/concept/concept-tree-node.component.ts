import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { map } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { IRI } from 'src/app/models/Resources';
import { SkosServices } from 'src/app/services/skos.service';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractTreeNode } from '../abstract-tree-node';

@Component({
	selector: 'concept-tree-node',
	templateUrl: './concept-tree-node.component.html',
})
export class ConceptTreeNodeComponent extends AbstractTreeNode {

    @Input() schemes: IRI[];
    
    @ViewChildren(ConceptTreeNodeComponent) viewChildrenNode: QueryList<ConceptTreeNodeComponent>;

	constructor(private skosService: SkosServices, basicModals: BasicModalsServices) {
		super(basicModals);
	}

    /**
     * Implementation of the expansion. It calls the  service for getting the child of a node in the given tree
     */
    expandNodeImpl() {
		return this.skosService.getNarrowerConcepts(this.node.getValue(), this.schemes).pipe(
            map(concepts => {
                let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
				ResourceUtils.sortResources(concepts, orderAttribute);
				return concepts;
            })
        );
    };

}
