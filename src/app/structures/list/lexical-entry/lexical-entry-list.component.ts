import { Component } from '@angular/core';
import { IRI } from 'src/app/models/Resources';
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

	private lexicon: IRI;

	constructor(private ontolexService: OntoLexLemonServices, private pmkiProp: PMKIProperties, eventHandler: PMKIEventHandler) {
		super(eventHandler);
		this.eventSubscriptions.push(eventHandler.lexiconChangedEvent.subscribe(
			(lexicon: IRI) => this.onLexiconChanged(lexicon))
		);
	}

	initImpl() {

		this.lexicon = this.pmkiProp.getActiveLexicon();

		this.loading = true;
		this.ontolexService.getLexicalEntriesByAlphabeticIndex("A", this.lexicon).subscribe(
			lexEntries => {
				this.loading = false;
				let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
				ResourceUtils.sortResources(lexEntries, orderAttribute);
				this.nodes = lexEntries;
			}
		);
	}
	
	private onLexiconChanged(lexicon: IRI) {
		// this.lexicon = lexicon;
		this.init();
    }

}
