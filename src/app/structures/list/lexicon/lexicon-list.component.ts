import { Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { OntoLexLemonServices } from 'src/app/services/ontolex-lemon.service';
import { PMKIContext } from 'src/app/utils/PMKIContext';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractList } from '../abstract-list';

@Component({
    selector: 'lexicon-list',
    templateUrl: './lexicon-list.component.html',
    host: { class: "structureComponent" }
})
export class LexiconListComponent extends AbstractList {

    structRole: RDFResourceRolesEnum = RDFResourceRolesEnum.limeLexicon;

    private activeLexicon: AnnotatedValue<IRI>;

    constructor(private ontolexService: OntoLexLemonServices, private pmkiProp: PMKIProperties, eventHandler: PMKIEventHandler) {
        super(eventHandler);
        //handler when active lexicon is changed programmatically when a searched entry belong to a non active lexicon
        this.eventSubscriptions.push(eventHandler.lexiconChangedEvent.subscribe(
            (lexicon: IRI) => {
                if (lexicon != null) {
                    this.activeLexicon = this.nodes.find(n => n.getValue().equals(lexicon));
                } else {
                    this.activeLexicon = null;
                }
            })
        );
    }

    initImpl() {
        this.loading = true;
        this.ontolexService.getLexicons().pipe(
            finalize(() => this.loading = false)
        ).subscribe(
            lexicons => {
                let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
                ResourceUtils.sortResources(lexicons, orderAttribute);
                for (let l of lexicons) {
                    let activeLexicon: IRI = PMKIContext.getProjectCtx().getProjectPreferences().activeLexicon;
                    if (activeLexicon != null && activeLexicon.equals(l.getValue())) {
                        this.activeLexicon = l;
                        break;
                    }
                };
                this.nodes = lexicons;
            }
        );
    }

    toggleLexicon(lexicon: AnnotatedValue<IRI>) {
        if (this.activeLexicon == lexicon) {
            this.activeLexicon = null;
        } else {
            this.activeLexicon = lexicon;
        }
        let activeLexiconIRI: IRI = this.activeLexicon != null ? this.activeLexicon.getValue() : null;
        this.pmkiProp.setActiveLexicon(PMKIContext.getProjectCtx(), activeLexiconIRI);
    }

}
