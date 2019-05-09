import { Component } from '@angular/core';
import { IRI, AnnotatedValue } from 'src/app/models/Resources';
import { SkosServices } from 'src/app/services/skos.service';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractList } from '../abstract-list';
import { finalize } from 'rxjs/operators';

@Component({
	selector: 'scheme-list',
    templateUrl: './scheme-list.component.html',
    host: { class: "structureComponent" }
})
export class SchemeListComponent extends AbstractList {

	constructor(private skosService: SkosServices, private pmkiProp: PMKIProperties, eventHandler: PMKIEventHandler) {
        super(eventHandler);
        //handler when active schemes is changed programmatically when a searched concept belong to a non active scheme
        this.eventSubscriptions.push(eventHandler.schemeChangedEvent.subscribe(
            (schemes: IRI[]) => {
                this.nodes.forEach((s: AnnotatedValue<IRI>) => s['checked'] = schemes.some(sc => sc.equals(s.getValue())));
            }
        ));
	}

	initImpl() {
		this.loading = true;
        this.skosService.getAllSchemes().pipe(
            finalize(() => this.loading = false)
        ).subscribe(
			schemes => {
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

    public activateAllScheme() {
        this.nodes.forEach(n => n['checked'] = true);
        this.updateActiveSchemesPref();
    }

    public deactivateAllScheme() {
        this.nodes.forEach(n => n['checked'] = false);
        this.updateActiveSchemesPref();
    }

}
