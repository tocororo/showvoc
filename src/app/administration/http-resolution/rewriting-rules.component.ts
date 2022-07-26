import { Component, Input } from '@angular/core';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { FormatExt, HttpResolutionUtils, RewritingRule } from 'src/app/models/HttpResolution';

@Component({
    selector: 'rewriting-rules',
    templateUrl: './rewriting-rules.component.html',
    host: { class: "vbox" }
})
export class RewritingRulesComponent {

    @Input() rules: RewritingRule[];

    readonly PH_FORMAT: string = "${format}";
    readonly PH_SOURCE_URI: string = "${sourceURI}";

    formats: FormatExt[] = [FormatExt.all, FormatExt.alldata, FormatExt.html, FormatExt.jsonld, FormatExt.n3, FormatExt.nt, FormatExt.rdf, FormatExt.ttl];

    constructor(private basicModals: BasicModalsServices) { }

    addRule() {
        this.rules.push({ sourceURIRegExp: "", format: FormatExt.alldata, targetURIExp: "" });
    }

    deleteRule(rule: RewritingRule) {
        this.rules.splice(this.rules.indexOf(rule), 1);
    }

    testRule(rule: RewritingRule) {
        let reValid = HttpResolutionUtils.isValidRegExp(rule.sourceURIRegExp);
        if (reValid.valid) {

            rule.testRuleResult = {};

            let sourceRegexp = new RegExp(rule.sourceURIRegExp);

            let matchResult: RegExpMatchArray = rule.testRuleSource.match(sourceRegexp);
            if (matchResult) {
                rule.testRuleResult.matched = true;
                rule.testRuleResult.entries = matchResult.map(r => r);
                rule.testRuleResult.groups = matchResult.groups;
    
                let targetRegExp = rule.targetURIExp;
                if (targetRegExp.includes(this.PH_SOURCE_URI)) {
                    targetRegExp = targetRegExp.replace(this.PH_SOURCE_URI, rule.testRuleSource);
                }
                if (targetRegExp.includes(this.PH_FORMAT)) {
                    if (rule.format != FormatExt.all && rule.format != FormatExt.alldata) {
                        targetRegExp = targetRegExp.replace(this.PH_FORMAT, rule.format);
                    } else {
                        targetRegExp = targetRegExp.replace(this.PH_FORMAT, "ext");
                    }
                }
                
                rule.testRuleResult.output = rule.testRuleSource.replace(sourceRegexp, targetRegExp);
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