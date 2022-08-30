import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ServiceInvocationDefinition } from 'src/app/models/InvokableReporter';
import { InvokableReporterModalServices } from "./modals/invokable-reporter-modal.service";

@Component({
    selector: "service-invocation",
    templateUrl: "./service-invocation.component.html",
    host: { class: "vbox" },
    styleUrls: ["../custom-services.css"]
})
export class ServiceInvocationComponent {
    @Input() invocation: ServiceInvocationDefinition;
    @Input() idx: number;
    @Output() update: EventEmitter<void> = new EventEmitter(); //tells to the parent that the service has been modified

    objectKeys = Object.keys; //used in template for iterate over invocation.arguments


    constructor(private invokableReporterModals: InvokableReporterModalServices) { }

    editInvocation() {
        this.invokableReporterModals.openServiceInvocationEditor({ key: "INVOKABLE_REPORTERS.ACTIONS.EDIT_SERVICE_INVOCATION" }, this.invocation.reporterRef, { def: this.invocation, idx: this.idx }).then(
            () => {
                this.update.emit();
            },
            () => { }
        );
    }

}