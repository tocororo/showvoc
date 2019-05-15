import { Component, Input, SimpleChanges } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LexEntryVisualizationMode } from 'src/app/models/Properties';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { OntoLexLemonServices } from 'src/app/services/ontolex-lemon.service';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { AbstractList } from '../abstract-list';

@Component({
    selector: 'lexical-entry-list',
    templateUrl: './lexical-entry-list.component.html',
    host: { class: "structureComponent" }
})
export class LexicalEntryListComponent extends AbstractList {

    @Input() lexicon: IRI;
    @Input() index: string; //initial letter of the entries to show

    structRole: RDFResourceRolesEnum.ontolexLexicalEntry;

    constructor(private ontolexService: OntoLexLemonServices, private pmkiProp: PMKIProperties, eventHandler: PMKIEventHandler) {
        super(eventHandler);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['index'] && !changes['index'].firstChange || changes['lexicon'] && !changes['lexicon'].firstChange) {
            this.init();
        }
    }

    initImpl() {
        if (this.lexicon != undefined) {
            if (this.pmkiProp.getLexicalEntryListPreferences().visualization == LexEntryVisualizationMode.indexBased && this.index != undefined) {
                this.nodes = [];
                this.loading = true;
                this.ontolexService.getLexicalEntriesByAlphabeticIndex(this.index, this.lexicon).pipe(
                    finalize(() => this.loading = false)
                ).subscribe(
                    entries => {
                        let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
                        ResourceUtils.sortResources(entries, orderAttribute);
                        this.nodes = entries;
                    }
                );
            } else if (this.pmkiProp.getLexicalEntryListPreferences().visualization == LexEntryVisualizationMode.searchBased) {
                //don't do nothing
            }
        }
    }

    public forceList(list: AnnotatedValue<IRI>[]) {
        this.setInitialStatus();
        this.nodes = list;
    }

}
