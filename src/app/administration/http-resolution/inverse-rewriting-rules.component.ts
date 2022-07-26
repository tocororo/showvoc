import { Component, Input, SimpleChanges } from '@angular/core';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { FormatExt, HttpResolutionUtils, InverseRewritingRule } from 'src/app/models/HttpResolution';

@Component({
    selector: 'inverse-rewriting-rules',
    templateUrl: './inverse-rewriting-rules.component.html',
    host: { class: "vbox" }
})
export class InverseRewritingRulesComponent {

    @Input() rules: InverseRewritingRule[];

    formatValues: FormatExt[] = [FormatExt.html, FormatExt.jsonld, FormatExt.n3, FormatExt.nt, FormatExt.rdf, FormatExt.ttl];

    constructor(private basicModals: BasicModalsServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['rules'] && changes['rules'].currentValue) {
            this.rules.forEach(r => {
                if (r.formatMap) {
                    r.formatMapSupport = Object.entries(r.formatMap).map(e => { 
                        return { key: e[0], value: e[1] };
                    });
                } else {
                    r.formatMapSupport = [];
                }
            });
        }
    }

    addRule() {
        this.rules.push({
            sourceRDFresURIregExp: "",
            targetResURIExp: "",
            formatMapSupport: []
        });
    }

    deleteRule(rule: InverseRewritingRule) {
        this.rules.splice(this.rules.indexOf(rule), 1);
    }

    addFormatMapping(rule: InverseRewritingRule) {
        rule.formatMapSupport.push({ key: "", value: "" });
    }

    deleteFormatMapping(rule: InverseRewritingRule, index: number) {
        rule.formatMapSupport.splice(index, 1);
    }

    testRule(rule: InverseRewritingRule) {
        let reValid = HttpResolutionUtils.isValidRegExp(rule.sourceRDFresURIregExp);
        if (reValid.valid) {

            rule.testRuleResult = {};

            let sourceRegexp = new RegExp(rule.sourceRDFresURIregExp);

            let matchResult: RegExpMatchArray = rule.testRuleSource.match(sourceRegexp);
            if (matchResult) {
                rule.testRuleResult.matched = true;
                rule.testRuleResult.entries = matchResult.map(r => r);
                rule.testRuleResult.groups = matchResult.groups;
                let format = matchResult.groups['format'];
                let mapping = rule.formatMapSupport.find(m => m.key == format);
                if (mapping) {
                    format = mapping.value;
                }
                rule.testRuleResult.format = format;
                rule.testRuleResult.output = rule.testRuleSource.replace(sourceRegexp, rule.targetResURIExp);
            } else {
                rule.testRuleResult.matched = false;
            }
        } else {
            this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: reValid.message }, ModalType.warning);
        }
    }

    /**
     * To prevent the view is re-created at every change and the focus on the input field get lost
     * https://stackoverflow.com/q/40314732/5805661
     * @param index 
     * @param obj 
     */
    trackByIndex(index: number, obj: any): any {
        return index;
    }

}