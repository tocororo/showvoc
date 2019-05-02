import { Component } from '@angular/core';
import { PropertiesServices } from 'src/app/services/properties.service';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractTree } from '../abstract-tree';

@Component({
	selector: 'property-tree',
	templateUrl: './property-tree.component.html',
	host: { class: "structureComponent" }
})
export class PropertyTreeComponent extends AbstractTree {

	constructor(private propertyService: PropertiesServices, eventHandler: PMKIEventHandler) {
		super(eventHandler);
	}

    initImpl() {
		this.loading = true;
		this.propertyService.getTopProperties().subscribe(
			properties => {
				this.loading = false;
				let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
				ResourceUtils.sortResources(properties, orderAttribute);
				this.nodes = properties;
			}
		);
    }

}
