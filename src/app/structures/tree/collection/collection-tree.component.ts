import { Component } from '@angular/core';
import { SkosServices } from 'src/app/services/skos.service';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractTree } from '../abstract-tree';

@Component({
	selector: 'collection-tree',
	templateUrl: './collection-tree.component.html',
	host: { class: "structureComponent" }
})
export class CollectionTreeComponent extends AbstractTree {

	constructor(private skosService: SkosServices, eventHandler: PMKIEventHandler) {
		super(eventHandler);
	}

    initImpl() {
		this.loading = true;
		this.skosService.getRootCollections().subscribe(
			collections => {
				this.loading = false;
				let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
				ResourceUtils.sortResources(collections, orderAttribute);
				this.nodes = collections;
			}
		);
    }

}
