import { Component, Input, OnInit } from '@angular/core';
import { PredicateObjects, IRI, AnnotatedValue, Value, ResAttribute, Resource, Literal } from 'src/app/models/Resources';
import { SKOS, SKOSXL } from 'src/app/models/Vocabulary';

// @Directive({
@Component({
    selector: 'renderer',
	templateUrl: './basic-renderer.component.html',
	styleUrls: ['../resource-view.css'],
	host: { class: "renderer" }
})
export class BasicRendererComponent implements OnInit {

	@Input() poList: PredicateObjects[];
	@Input() rendering: boolean = true; //if true the resource should be rendered with the show, with the qname otherwise

	constructor() { }

	ngOnInit() {
		//compute human readable label for the predicates
		this.poList.forEach(po => {
			let pred = po.getPredicate();
			pred['humanReadable'] = this.getHumanReadablePredicate(pred);
		})
	}

	private getHumanReadablePredicate(predicate: AnnotatedValue<IRI>): string {
		let predicateIRI: IRI = predicate.getValue();
		//special cases
		if (predicateIRI.equals(SKOS.prefLabel) || predicateIRI.equals(SKOSXL.prefLabel)) {
			return "Preferred Label";
		} else if (predicateIRI.equals(SKOS.altLabel) || predicateIRI.equals(SKOSXL.altLabel)) {
			return "Alternative Label";
		} else if (predicateIRI.equals(SKOS.hiddenLabel) || predicateIRI.equals(SKOSXL.hiddenLabel)) {
			return "Hidden Label";
		}
		//generic case: split the camel case local name of the predicate
		let predLocalName = predicateIRI.getLocalName();
		let splitted: string = predLocalName.replace(/([a-z])([A-Z])/g, '$1 $2');
		return splitted.charAt(0).toLocaleUpperCase() + splitted.slice(1); //upper case the first letter
	}

	private isResourceWithLang(obj: AnnotatedValue<Value>): boolean {
		if (obj.getAttribute(ResAttribute.LANG) != null) {
			return true;
		} else {
			let value = obj.getValue();
			if (value instanceof Literal) {
				return value.getLanguage() != null;
			}
		}
	}

	private getLang(obj: AnnotatedValue<Value>): string {
		let lang: string = obj.getAttribute(ResAttribute.LANG);
		if (lang == null) {
			let value = obj.getValue();
			if (value instanceof Literal) {
				lang = value.getLanguage();
			}
		}
		return lang;
	}

	/**
	 * If the object is a Resource, it should be clickable. The clicke emits and event that propagate untill the dataset-view.
	 * In case the Resource has the same role of the one selected in that moment, found the resource in the tree, otherwise open it in a modal
	 * Check nature and role of the resource to determine the action
	 */

}