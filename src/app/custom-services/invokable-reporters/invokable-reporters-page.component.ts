import { Component } from "@angular/core";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { InvokableReportersServices } from 'src/app/services/invokable-reporters.service';
import { Reference } from "../../models/Configuration";
import { InvokableReporterModalServices } from "./modals/invokable-reporter-modal.service";

@Component({
    selector: "invokable-reporters-component",
    templateUrl: "./invokable-reporters-page.component.html",
    host: { class: "hbox" },
})
export class InvokableReportersPageComponent {

    reporters: Reference[];
    selectedReporter: Reference;

    constructor(private invokableReporterService: InvokableReportersServices, private invokableReporterModals: InvokableReporterModalServices,
        private basicModals: BasicModalsServices) { }

    ngOnInit() {
        this.initReporters();
    }

    private initReporters() {
        this.invokableReporterService.getInvokableReporterIdentifiers().subscribe(
            references => {
                this.reporters = references;
            }
        );
    }

    selectReporter(reporter: Reference) {
        this.selectedReporter = reporter;
    }

    createReporter() {
        this.invokableReporterModals.openInvokableReporterEditor({ key: "INVOKABLE_REPORTERS.ACTIONS.CREATE_INVOKABLE_REPORT" }, this.reporters).then(
            () => {
                this.initReporters();
            },
            () => { }
        );
    }

    deleteReporter() {
        this.basicModals.confirm({ key: "INVOKABLE_REPORTERS.ACTIONS.DELETE_INVOKABLE_REPORT" }, { key: "INVOKABLE_REPORTERS.MESSAGES.DELETE_INVOKABLE_REPORT_CONFIRM" }, ModalType.warning).then(
            () => {
                this.invokableReporterService.deleteInvokableReporter(this.selectedReporter.relativeReference).subscribe(
                    () => {
                        this.initReporters();
                    }
                );
            }
        );
    }

}