import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { AnnotatedValue, ResAttribute, Resource, Value } from 'src/app/models/Resources';
import { ResourceUtils } from 'src/app/utils/ResourceUtils';

@Component({
    selector: 'value-renderer',
    templateUrl: './value-renderer.component.html',
    styleUrls: ["../resource-view.css", "./manchester.css"],
})
export class ValueRendererComponent {

    @Input() value: AnnotatedValue<Value>;
    @Input() rendering: boolean = true; //if true the resource should be rendered with the show, with the qname otherwise

    renderedValue: string;

    lang: string; //language of the resource

    manchExpr: boolean = false;
    private manchExprStruct: { token: string, class: string }[] = [];

    constructor() { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['value'] && changes['value'].currentValue) {
            this.init();
        } else if (changes['rendering']) {
            this.initRenderedValue();
        }
    }

    private init() {
        this.initRenderedValue();
        this.initLang();
        this.initManchExpr();
    }

    private initLang() {
        this.lang = this.value.getLanguage();
    }

    private initRenderedValue() {
        this.renderedValue = ResourceUtils.getRendering(this.value, this.rendering);
    }

    private initManchExpr() {
        if (this.value.getValue().isBNode() && this.value.getAttribute(ResAttribute.SHOW_INTERPR) != null) {
            this.manchExpr = true;
        }
        if (this.manchExpr) {
            let booleans = ["true", "false"];
            let builtinDatatypes = ["decimal", "double", "float", "integer", "string"];
            let characteristics = ["Functional", "InverseFunctional", "Reflexive", "Irreflexive", "Symmetric", "Asymmetric", "Transitive", "Inverse"];
            let conjuctions = ["and", "not", "that", "or"];
            let facets = ["langRange", "length", "maxLength", "minLength", "pattern", "<", "<=", ">", ">="];
            let quantifiers = ["some", "only", "value", "min", "max", "exactly", "self"];

            let booleansRegex: RegExp = this.getRegexp(booleans, false);
            let builtinDatatypesRegex: RegExp = this.getRegexp(builtinDatatypes, true);
            let characteristicsRegex: RegExp = this.getRegexp(characteristics, false);
            let conjuctionsRegex: RegExp = this.getRegexp(conjuctions, false);
            let facetsRegex: RegExp = this.getRegexp(facets, true);
            let quantifiersRegex: RegExp = this.getRegexp(quantifiers, false);
            let bracketsRegex: RegExp = /(\{|\[|\(|\}|\]|\))/g;

            let tokenizerStruct: { regex: RegExp, tokenClass: string }[] = [
                { regex: /"(?:[^\\]|\\.)*?(?:"|$)/, tokenClass: "string" },
                { regex: booleansRegex, tokenClass: "boolean" },
                { regex: builtinDatatypesRegex, tokenClass: "builtinDatatype" },
                { regex: characteristicsRegex, tokenClass: "characteristic" },
                { regex: conjuctionsRegex, tokenClass: "conjuction" },
                { regex: facetsRegex, tokenClass: "facet" },
                { regex: quantifiersRegex, tokenClass: "quantifier" },
                { regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, tokenClass: "number" },
                { regex: /\/(?:[^\\]|\\.)*?\//, tokenClass: "variable-3" },
                { regex: bracketsRegex, tokenClass: "bracket" },
                { regex: /[a-z$][\w$]*/, tokenClass: "variable" },
            ];

            let show = this.value.getShow();
            show = show.replace(/([\{\[\(\}\]\)])/g, " $1 ").replace(/\s+/g, " ").trim(); //add spaces before and after brackets, remove multiple spaces, remove ending space
            let splitted: string[] = show.split(" ");
            this.manchExprStruct = [];
            splitted.forEach((s, idx, array) => {
                let tokenCls: string;
                for (let ts of tokenizerStruct) {
                    if (ts.regex.test(s)) {
                        tokenCls = ts.tokenClass;
                        break;
                    }
                }
                this.manchExprStruct.push({ token: s, class: "cm-" + tokenCls });
                if (idx != array.length - 1) {
                    //add a whitespace token just as separator between other tokens (exept after the laast)
                    this.manchExprStruct.push({ token: " ", class: "" });
                }

            })
        }
    }

    private getRegexp(tokensList: string[], caseSentitive: boolean) {
        if (caseSentitive) {
            return new RegExp("(?:" + tokensList.join("|") + ")\\b");
        } else {
            return new RegExp("(?:" + tokensList.join("|") + ")\\b", "i");
        }
    }

}