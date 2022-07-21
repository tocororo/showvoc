import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/modal-dialogs/Modals';
import { AnnotatedValue, IRI, Literal, RDFResourceRolesEnum, Value } from 'src/app/models/Resources';
import { BindingTypeEnum, VariableBindings } from 'src/app/models/Sparql';
import { NTriplesUtil } from 'src/app/utils/ResourceUtils';
import { QueryParameterizerModal } from "./query-parameterizer-modal";

@Component({
    selector: "query-param-form",
    templateUrl: "./query-parameter-form.component.html"
})
export class QueryParameterForm {

    @Input() bindings: VariableBindings;
    @Input() configurable: boolean = true; //if true allows to change the parametrization, if false the edit button is hidden as well as the "use bindings" checkbox
    @Input() mode: "search" | "sparql" = "sparql"; //search mode shows displayName, sparql mode shows variable names
    @Output() update = new EventEmitter<Map<string, Value>>();
    @Output() paramsChange = new EventEmitter<VariableBindings>(); //when parametrization changes, useful to the parent in order to detect unsaved parametrizations

    bindingStructs: BindingStruct[];
    useBindings: boolean = true;

    showDisplayName: boolean = false;

    constructor(private modalService: NgbModal) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['bindings'] && changes['bindings'].currentValue) {
            this.initBindingStruct();
        }
    }

    /**
     * Adapt VariableBindings in a model (BindingStruct[]) more suitable for the UI
     */
    private initBindingStruct() {
        this.bindingStructs = [];
        setTimeout(() => { //let destroy the view, so that in case it is changed just the let names, the table is rebuilt with no UI problem
            for (let varName in this.bindings) {
                let bs: BindingStruct = {
                    varName: varName,
                    displayName: this.bindings[varName].displayName,
                    description: this.bindings[varName].description,
                    bindingType: this.bindings[varName].bindingType
                };
                if (this.bindings[varName].bindingType == BindingTypeEnum.assignment) {
                    bs.value = NTriplesUtil.parseValue(this.bindings[varName].value);
                } else if (this.bindings[varName].bindingType == BindingTypeEnum.constraint) {
                    if (this.bindings[varName].datatype != null) {
                        bs.datatype = NTriplesUtil.parseIRI(this.bindings[varName].datatype);
                    } else if (this.bindings[varName].resourceRole != null) {
                        bs.resourceRole = this.bindings[varName].resourceRole;
                    }
                }
                this.bindingStructs.push(bs);
            }
            this.emitUpdate();
        });
    }

    onResourceChanged(binding: BindingStruct, value: AnnotatedValue<IRI>) {
        binding.value = value.getValue();
        this.emitUpdate();
    }

    onLiteralChanged(binding: BindingStruct, value: AnnotatedValue<Literal>) {
        binding.value = value.getValue();
        this.emitUpdate();
    }

    editParameterization() {
        const modalRef: NgbModalRef = this.modalService.open(QueryParameterizerModal, new ModalOptions('xl'));
        modalRef.componentInstance.variableBindings = this.bindings;
        return modalRef.result.then(
            (updatedVarBindings: VariableBindings) => {
                this.bindings = updatedVarBindings;
                this.paramsChange.emit(this.bindings);
            },
            () => { }
        );
    }

    /**
     * When variable bnindings changed
     */
    private emitUpdate() {
        let bindingsMap: Map<string, Value> = new Map();
        if (this.useBindings) {
            this.bindingStructs.forEach(bs => {
                bindingsMap.set(bs.varName, bs.value);
            });
        }
        this.update.emit(bindingsMap);
    }

}

class BindingStruct {
    varName: string;
    displayName?: string;
    description?: string;
    bindingType: BindingTypeEnum;
    resourceRole?: RDFResourceRolesEnum; //if type is constraint
    datatype?: IRI; //if type is constraint
    value?: Value; //if type is assignment
}