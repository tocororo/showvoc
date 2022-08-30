import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from "@angular/core";
import { YasguiComponent } from 'src/app/datasets/sparql/yasgui.component';
import { CustomOperationDefinition, CustomOperationTypes, TypeUtils } from "../../models/CustomService";
import { CustomServiceModalServices } from "./modals/custom-service-modal.service";

@Component({
    selector: "custom-operation",
    templateUrl: "./custom-operation.component.html",
    host: { class: "vbox" },
    styleUrls: ["../custom-services.css"]
})
export class CustomOperationComponent {
    @Input() operation: CustomOperationDefinition;
    @Input() readonly: boolean;
    @Output() update: EventEmitter<void> = new EventEmitter(); //tells to the parent that the service has been modified
    @ViewChild(YasguiComponent, { static: false }) viewChildYasgui: YasguiComponent;

    isSparql: boolean;
    parameters: { prettyPrint: string, required: boolean }[] = [];
    returns: string;

    constructor(private customServiceModals: CustomServiceModalServices, private changeDetectorRef: ChangeDetectorRef) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['operation'].currentValue) {
            this.returns = TypeUtils.serializeType(this.operation.returns);
            if (this.operation.parameters != null) {
                this.parameters = this.operation.parameters.map(p => {
                    return { prettyPrint: TypeUtils.serializeParameter(p), required: p.required };
                });
            }

            this.isSparql = this.operation["@type"] == CustomOperationTypes.SparqlOperation;
            if (this.isSparql) {
                this.changeDetectorRef.detectChanges(); //give time to init yasgui component
                this.viewChildYasgui.forceContentUpdate();
            }

        }
    }

    editOperation() {
        this.customServiceModals.openCustomOperationEditor({ key: "CUSTOM_SERVICES.ACTIONS.EDIT_CUSTOM_OPERATION" }, this.operation.serviceId, this.operation).then(
            () => {
                this.update.emit();
            },
            () => { }
        );
    }

}