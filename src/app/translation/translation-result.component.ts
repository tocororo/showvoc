import { Component, Input } from "@angular/core";
import { Router } from '@angular/router';
import { TranslationDetail, TranslationResult, TranslationValue } from '../models/Search';
import { ShowVocUrlParams } from '../models/ShowVoc';
import { RDFS, SKOS, SKOSXL } from '../models/Vocabulary';

@Component({
    selector: "translation-result",
    templateUrl: "./translation-result.component.html"
})
export class TranslationResultComponent {

    @Input() result: TranslationResult;
    @Input() accessible: boolean;

    matchedResUri: string;
    matchedResLexicalizations: TranslationDetail[] = [];
    matchedResDefinitions: TranslationDetail[] = [];

    translations: {
        lang: string,
        lexicalizations: TranslationValue[],
        definitions: TranslationValue[],
    }[] = [];


    private predicateOrder: string[] = [
        SKOSXL.prefLabel.getIRI(), SKOSXL.altLabel.getIRI(), SKOSXL.hiddenLabel.getIRI(),
        SKOS.prefLabel.getIRI(), SKOS.altLabel.getIRI(), SKOS.hiddenLabel.getIRI(),
        RDFS.label.getIRI()
    ];

    constructor(private router: Router) { }

    ngOnInit() {
        this.matchedResUri = this.result.resource;

        this.result.descriptions.forEach(d => {
            d.values.forEach(v => {
                if (v.type == "lexicalization") {
                    let lex = this.matchedResLexicalizations.find(l => l.lang == d.lang);
                    if (lex == null) {
                        lex = { lang: d.lang, values: [] };
                        this.matchedResLexicalizations.push(lex);
                    }
                    lex.values.push(v);
                } else { //note
                    let def = this.matchedResDefinitions.find(l => l.lang == d.lang);
                    if (def == null) {
                        def = { lang: d.lang, values: [] };
                        this.matchedResDefinitions.push(def);
                    }
                    def.values.push(v);
                }
            });
        });
        this.matchedResLexicalizations.forEach(l => l.values.sort(this.sortPredicates(this.predicateOrder)));

        this.result.translations.forEach(t => {
            let transl = this.translations.find(l => l.lang == t.lang);
            if (transl == null) {
                transl = { lang: t.lang, lexicalizations: [], definitions: [] };
                this.translations.push(transl);
            }
            t.values.forEach(v => {
                if (v.type == "lexicalization") {
                    transl.lexicalizations.push(v);
                } else { //note
                    transl.definitions.push(v);
                }
            });
        });
        this.translations.forEach(t => t.lexicalizations.sort(this.sortPredicates(this.predicateOrder)));
    }


    goToResource(result: TranslationResult) {
        this.router.navigate(["/datasets/" + result.repository.id + "/data"], { queryParams: { [ShowVocUrlParams.resId]: result.resource } });
    }

    private sortPredicates(order: string[]) {
        return (a: TranslationValue, b: TranslationValue) => {
            let indexPredA = order.indexOf(a.predicate);
            let indexPredB = order.indexOf(b.predicate);
            if (indexPredA == -1) return 1;
            else if (indexPredB == -1) return -1;
            else return indexPredA - indexPredB;
        };
    }


}