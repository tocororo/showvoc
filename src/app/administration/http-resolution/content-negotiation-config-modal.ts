import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { HttpResolutionUtils, InverseRewritingRule, RewritingRule } from 'src/app/models/HttpResolution';
import { Settings } from 'src/app/models/Plugins';
import { Project } from 'src/app/models/Project';
import { SettingsEnum } from 'src/app/models/Properties';
import { HttpResolutionServices } from 'src/app/services/http-resolution.service';
import { UIUtils } from 'src/app/utils/UIUtils';
import { InverseRewritingRulesComponent } from './inverse-rewriting-rules.component';
import { RewritingRulesComponent } from './rewriting-rules.component';

@Component({
    selector: 'cont-neg-config-modal',
    templateUrl: './content-negotiation-config-modal.html',
})
export class ContentNegotiationConfigurationModal {

    @Input() project: Project;

    @ViewChild(RewritingRulesComponent) rewritingRulesChild: RewritingRulesComponent;
    @ViewChild(InverseRewritingRulesComponent) inverseRewritingRulesChild: InverseRewritingRulesComponent;

    activeTab: TabEnum = "rewritingRules";

    rewritingRules: RewritingRule[] = [];
    inverseRewritingRules: InverseRewritingRule[] = [];

    private readonly FORMAT_NAMED_GROUP: string = "?<format>";

    constructor(public activeModal: NgbActiveModal, private httpResolutionService: HttpResolutionServices, private basicModals: BasicModalsServices, private elementRef: ElementRef) { }

    ngOnInit() {
        this.httpResolutionService.getContentNegotiationSettings(this.project.getName()).subscribe(
            (contentNegotiationSettings: Settings) => {
                this.rewritingRules = contentNegotiationSettings.getPropertyValue(SettingsEnum.rewritingRules);
                if (!this.rewritingRules) {
                    this.rewritingRules = [];
                }
                this.inverseRewritingRules = contentNegotiationSettings.getPropertyValue(SettingsEnum.inverseRewritingRules);
                if (!this.inverseRewritingRules) {
                    this.inverseRewritingRules = [];
                }
            }
        );
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    addRule() {
        if (this.activeTab == "rewritingRules") {
            this.rewritingRulesChild.addRule();
        } else {
            this.inverseRewritingRulesChild.addRule();
        }
    }

    checkRulesValidity(): boolean {
        for (let rule of this.rewritingRules) {
            //checks on source regular expressions
            if (rule.sourceURIRegExp == "") {
                this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "Detected a rewriting rule with empty source RegExp" }, ModalType.warning);
                return false;
            } else {
                let reValid = HttpResolutionUtils.isValidRegExp(rule.sourceURIRegExp);
                if (!reValid.valid) {
                    this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: reValid.message }, ModalType.warning);
                    return false;
                }
            }
            //checks on target regular expressions
            if (rule.targetURIExp == "") {
                this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "Detected a rewriting rule with empty target expression" }, ModalType.warning);
                return false;
            } else {
                let reValid = HttpResolutionUtils.isValidRegExp(rule.targetURIExp);
                if (!reValid.valid) {
                    this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: reValid.message }, ModalType.warning);
                    return false;
                }
            }
        }

        for (let rule of this.inverseRewritingRules) {
            //checks on source regular expressions
            if (rule.sourceRDFresURIregExp == "") {
                this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "Detected an inverse rewriting rule with empty source RegExp" }, ModalType.warning);
                return false;
            } else {
                let reValid = HttpResolutionUtils.isValidRegExp(rule.sourceRDFresURIregExp);
                if (!reValid.valid) {
                    this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: reValid.message }, ModalType.warning);
                    return false;
                }
                if (!rule.sourceRDFresURIregExp.includes(this.FORMAT_NAMED_GROUP)) {
                    this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "Detected an inverse rewriting rule with missing " + this.FORMAT_NAMED_GROUP + " named group" }, ModalType.warning);
                    return false;
                }
            }
            //checks on target regular expressions
            if (rule.targetResURIExp == "") {
                this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "Detected an inverse rewriting rule with empty target expression" }, ModalType.warning);
                return false;
            } else {
                let reValid = HttpResolutionUtils.isValidRegExp(rule.targetResURIExp);
                if (!reValid.valid) {
                    this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: reValid.message }, ModalType.warning);
                    return false;
                }
            }
            //checks on format mappings
            if (rule.formatMapSupport && rule.formatMapSupport.some((m, pos, list) => list.findIndex(el => el.key == m.key) != pos)) {
                this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "Detected an inverse rewriting rule with duplicated mappings for the same format" }, ModalType.warning);
                return false;
            }
        }

        return true;
    }

    ok() {
        if (!this.checkRulesValidity()) {
            return;
        }
        this.inverseRewritingRules.forEach(r => {
            //"normalize" the format map from the support list structure to the actual map
            r.formatMap = {};
            if (r.formatMapSupport) {
                r.formatMapSupport.filter(m => m.key.trim() != "" && m.value != null)
                    .forEach(m => { r.formatMap[m.key] = m.value; });
            }
        });
        let settings: ContentNegotiationSettings = {
            rewritingRules: this.rewritingRules,
            inverseRewritingRules: this.inverseRewritingRules
        };
        this.httpResolutionService.storeContentNegotiationSettings(settings, this.project.getName()).subscribe(
            () => {
                this.activeModal.close();
            }
        );
    }

    close() {
        this.activeModal.dismiss();
    }


}

export interface ContentNegotiationSettings {
    rewritingRules?: RewritingRule[];
    inverseRewritingRules?: InverseRewritingRule[];
}

type TabEnum = "rewritingRules" | "inverseRewritingRules";