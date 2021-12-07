import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { AnnotatedValue, IRI, Literal, PredicateObjects, ResAttribute, Resource, Value } from 'src/app/models/Resources';
import { SKOS, SKOSXL } from 'src/app/models/Vocabulary';
import { ResourceUtils } from 'src/app/utils/ResourceUtils';

@Component({
    selector: 'renderer',
    templateUrl: './basic-renderer.component.html',
    styleUrls: ['../resource-view.css'],
    host: { class: "renderer" }
})
export class BasicRendererComponent {

    @Input() poList: PredicateObjects[];
    @Input() rendering: boolean = true; //if true the resource should be rendered with the show, with the qname otherwise

    @Output() dblclickObj: EventEmitter<AnnotatedValue<Value>> = new EventEmitter<AnnotatedValue<Value>>();

    constructor() { }

    ngOnChanges(changes: SimpleChanges) {
        /**
         * compute:
         * - human readable label for the predicates
         * * - clickable flag for objects
         */
        this.poList.forEach(po => {
            let pred = po.getPredicate();
            pred['humanReadable'] = this.getHumanReadablePredicate(pred);
            po.getObjects().forEach(o => {
                if (o.getValue() instanceof Resource) {
                    o['clickable'] = true;
                }
            })
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

    isResourceWithLang(obj: AnnotatedValue<Value>): boolean {
        return obj.getLanguage() != null;
    }

    getLang(obj: AnnotatedValue<Value>): string {
        return obj.getLanguage();
    }

    getRendering(obj: AnnotatedValue<Value>): string {
        return ResourceUtils.getRendering(obj, this.rendering);
    }

    objectDblClick(obj: AnnotatedValue<Value>) {
        if (obj.getValue() instanceof Resource) {
            this.dblclickObj.emit(obj);
        }
    }
}