import { Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { SkosServices } from 'src/app/services/skos.service';
import { SVContext } from 'src/app/utils/SVContext';
import { SVEventHandler } from 'src/app/utils/SVEventHandler';
import { SVProperties } from 'src/app/utils/SVProperties';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractList } from '../abstract-list';

@Component({
    selector: 'scheme-list',
    templateUrl: './scheme-list.component.html',
    host: { class: "structureComponent" }
})
export class SchemeListComponent extends AbstractList {

    structRole: RDFResourceRolesEnum = RDFResourceRolesEnum.conceptScheme;

    constructor(private skosService: SkosServices, private svProp: SVProperties, eventHandler: SVEventHandler) {
        super(eventHandler);
        //handler when active schemes is changed programmatically when a searched concept belong to a non active scheme
        this.eventSubscriptions.push(eventHandler.schemeChangedEvent.subscribe(
            (schemes: IRI[]) => {
                this.nodes.forEach((s: AnnotatedValue<IRI>) => { s['checked'] = schemes.some(sc => sc.equals(s.getValue())); });
            }
        ));
    }

    initImpl() {
        this.loading = true;
        this.skosService.getAllSchemes().pipe(
            finalize(() => { this.loading = false; })
        ).subscribe(
            schemes => {
                let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
                ResourceUtils.sortResources(schemes, orderAttribute);
                schemes.forEach(s => {
                    let activeSchemes: IRI[] = SVContext.getProjectCtx().getProjectPreferences().activeSchemes;
                    if (activeSchemes.some(as => as.equals(s.getValue()))) {
                        s['checked'] = true;
                    }
                });
                this.nodes = schemes;
            }
        );
    }

    updateActiveSchemesPref() {
        this.svProp.setActiveSchemes(SVContext.getProjectCtx(), this.collectCheckedSchemes());
    }

    private collectCheckedSchemes(): IRI[] {
        //collect all the active scheme
        let activeSchemes: IRI[] = [];
        this.nodes.forEach(n => {
            if (n['checked']) {
                activeSchemes.push(n.getValue());
            }
        });
        return activeSchemes;
    }

    public activateAllScheme() {
        this.nodes.forEach(n => { n['checked'] = true; });
        this.updateActiveSchemesPref();
    }

    public deactivateAllScheme() {
        this.nodes.forEach(n => { n['checked'] = false; });
        this.updateActiveSchemesPref();
    }

}
