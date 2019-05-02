import { Component } from '@angular/core';
import { IRI } from 'src/app/models/Resources';
import { SkosServices } from 'src/app/services/skos.service';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractTree } from '../abstract-tree';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';

@Component({
    selector: 'concept-tree',
    templateUrl: './concept-tree.component.html',
    host: { class: "structureComponent" }
})
export class ConceptTreeComponent extends AbstractTree {

    private schemes: IRI[];

    constructor(private skosService: SkosServices, private pmkiProp: PMKIProperties, eventHandler: PMKIEventHandler) {
        super(eventHandler);
        this.eventSubscriptions.push(eventHandler.schemeChangedEvent.subscribe(
            (schemes: IRI[]) => this.onSchemeChanged(schemes))
        );
    }

    initImpl() {

        this.schemes = this.pmkiProp.getActiveSchemes();

        this.loading = true;
        this.skosService.getTopConcepts(this.schemes).subscribe(
            concepts => {
                this.loading = false;
                let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
                ResourceUtils.sortResources(concepts, orderAttribute);
                this.nodes = concepts;
            }
        );
    }

    private onSchemeChanged(schemes: IRI[]) {
        // this.schemes = schemes;
        this.init()
    }

}
