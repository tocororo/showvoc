import { Component } from '@angular/core';
import { IRI } from 'src/app/models/Resources';
import { SkosServices } from 'src/app/services/skos.service';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractList } from '../abstract-list';

@Component({
	selector: 'scheme-list',
	templateUrl: './scheme-list.component.html',
})
export class SchemeListComponent extends AbstractList {


	constructor(private skosService: SkosServices, private pmkiProp: PMKIProperties, eventHandler: PMKIEventHandler) {
		super(eventHandler);
	}

	initImpl() {
		this.loading = true;
		this.skosService.getAllSchemes().subscribe(
			schemes => {
				this.loading = false;
				let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
				ResourceUtils.sortResources(schemes, orderAttribute);
				schemes.forEach(s => {
					if (this.pmkiProp.isActiveScheme(s.getValue())) {
						s['checked'] = true;
					}
				});
				this.nodes = schemes;
			}
		);
	}

	updateActiveSchemesPref() {
		this.pmkiProp.setActiveSchemes(this.collectCheckedSchemes())
	}

	private collectCheckedSchemes(): IRI[] {
        //collect all the active scheme
		var activeSchemes: IRI[] = [];
		this.nodes.forEach(n => {
			if (n['checked']) {
				activeSchemes.push(n.getValue());
			}
		});
        return activeSchemes;
    }

}
