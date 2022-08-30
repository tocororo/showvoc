import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { ConfigurationsServices } from 'src/app/services/configuration.service';
import { SVContext } from 'src/app/utils/SVContext';
import { ConfigurationComponents, Reference } from "../../../models/Configuration";
import { AdditionalFile, InvokableReporter, InvokableReporterDefinition } from "../../../models/InvokableReporter";
import { Scope, ScopeUtils, SettingsProp } from "../../../models/Plugins";
import { InvokableReportersServices } from "../../../services/invokable-reporters.service";
import { InvokableReporterForm } from "../invokable-reporter.component";

@Component({
    selector: "invokable-reporter-editor-modal",
    templateUrl: "./invokable-reporter-editor-modal.html",
})
export class InvokableReporterEditorModal {
    @Input() title: string = 'Modal Title';
    @Input() existingReporters: Reference[];
    @Input() reporterRef: Reference;

    isAdmin: boolean; //only admin can use the storage manager

    id: string;
    scopes: Scope[];
    selectedScope: Scope;
    form: InvokableReporterForm;

    additionalFilesPreview: string;

    constructor(public activeModal: NgbActiveModal, private configurationServices: ConfigurationsServices,
        private invokableReporterService: InvokableReportersServices, private basicModals: BasicModalsServices,
        private sharedModals: SharedModalsServices) {
    }

    ngOnInit() {
        this.isAdmin = SVContext.getLoggedUser().isAdmin();
        if (this.reporterRef == null) { //create
            this.invokableReporterService.getInvokableReporterForm().subscribe(
                reporter => {
                    this.initForm(reporter);
                    this.form.mimeType.value = "text/html";
                }
            );
            this.configurationServices.getConfigurationManager(ConfigurationComponents.INVOKABLE_REPORER_STORE).subscribe(
                cfgMgr => {
                    this.scopes = cfgMgr.configurationScopes;
                    this.selectedScope = cfgMgr.scope;
                }
            );
        } else { //edit
            this.id = this.reporterRef.identifier;
            this.invokableReporterService.getInvokableReporter(this.reporterRef.relativeReference).subscribe(
                reporter => {
                    this.initForm(reporter);
                }
            );
        }
    }

    private initForm(reporter: InvokableReporter) {
        this.form = {
            label: reporter.getProperty("label"),
            description: reporter.getProperty("description"),
            sections: reporter.getProperty("sections"),
            template: reporter.getProperty("template"),
            filename: reporter.getProperty("filename"),
            additionalFiles: reporter.getProperty("additionalFiles"),
            mimeType: reporter.getProperty("mimeType")
        };
    }

    editAdditionalFiles() {
        let additionalFilesPaths: string[] = this.form.additionalFiles.value ? this.form.additionalFiles.value.map(f => f.sourcePath) : [];
        this.sharedModals.storageManager({ key: "WIDGETS.STORAGE_MGR.STORAGE_MANAGER" }, additionalFilesPaths, true).then(
            (files: string[]) => {
                let additionalFiles: AdditionalFile[] = files.map(f => {
                    return {
                        sourcePath: f,
                        destinationPath: "resources/" + f.substring(f.lastIndexOf("/") + 1),
                        required: true
                    };
                });
                this.form.additionalFiles.value = additionalFiles;
            },
            () => { }
        );
    }

    removeAdditionalFile(file: AdditionalFile) {
        this.form.additionalFiles.value.splice(this.form.additionalFiles.value.indexOf(file), 1);
    }

    isDataValid(): boolean {
        if (this.id == null || this.id.trim() == "") {
            return false;
        }
        for (let field in this.form) {
            let f: SettingsProp = this.form[field];
            if (f.requireConfiguration()) {
                return false;
            }
        }
        return true;
    }

    ok() {
        if (!this.isDataValid()) {
            return;
        }

        let reporterDef: InvokableReporterDefinition = {
            label: this.form.label.value,
            description: this.form.description.value,
            template: this.form.template.value,
            sections: this.form.sections.value,
            filename: this.form.filename.value,
            additionalFiles: this.form.additionalFiles.value,
            mimeType: this.form.mimeType.value
        };

        if (this.reporterRef == null) { //create
            let reference = ScopeUtils.serializeScope(this.selectedScope) + ":" + this.id;
            //check if id is not duplicated
            if (this.existingReporters.some(r => r.relativeReference == reference)) {
                this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "INVOKABLE_REPORTERS.MESSAGES.ALREADY_EXISTING_INVOKABLE_REPORTER_ID" }, ModalType.warning);
                return;
            }
            this.invokableReporterService.createInvokableReporter(reference, reporterDef).subscribe(
                () => {
                    this.activeModal.close();
                }
            );
        } else { //edit
            this.invokableReporterService.updateInvokableReporter(this.reporterRef.relativeReference, reporterDef).subscribe(
                () => {
                    this.activeModal.close();
                }
            );
        }

    }

    cancel() {
        this.activeModal.dismiss();
    }

}