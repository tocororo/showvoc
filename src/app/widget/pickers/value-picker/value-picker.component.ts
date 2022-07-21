import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { AnnotatedValue, IRI, Literal, RDFResourceRolesEnum, RDFTypesEnum, Value } from 'src/app/models/Resources';
import { NTriplesUtil } from '../../../utils/ResourceUtils';

@Component({
    selector: 'value-picker',
    templateUrl: './value-picker.component.html',
})
export class ValuePickerComponent {
    
    @Input() value: AnnotatedValue<Value>;
    @Input() roles: RDFResourceRolesEnum[]; //list of pickable resource roles
    // @Input() disabled: boolean = false;
    @Input() editable: boolean = false; //tells if the value can be manually edited (only for URI)
    @Input() disabled: boolean = false;
    @Input() size: string;
    @Output() valueChanged = new EventEmitter<AnnotatedValue<Value>>();

    resTypes: { show: string, value: RDFTypesEnum }[] = [
        { show: "IRI", value: RDFTypesEnum.uri },
        { show: "Literal", value: RDFTypesEnum.literal }
    ];
    selectedResType: { show: string, value: RDFTypesEnum } = this.resTypes[0];

    formControlClass: string = "form-control";

    constructor() { }

    ngOnInit() {
        this.init();
        //if the input size is not valid, set default to "sm"
        if (this.size == "sm" || this.size == "md" || this.size == "lg") {
            this.formControlClass += " form-control-" + this.size;
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        this.init();
    }

    private init() {
        if (this.value) {
            if (typeof this.value == 'string') { //input si the NT serialization of the value => restore the ARTNode
                if ((<string>this.value).startsWith("<") && (<string>this.value).endsWith(">")) { //uri
                    this.value = new AnnotatedValue(NTriplesUtil.parseIRI(this.value));
                } else if ((<string>this.value).startsWith("\"")) { //literal
                    this.value = new AnnotatedValue(NTriplesUtil.parseLiteral(this.value));
                }
            }
            //set the res type
            if (this.value.getValue().isIRI()) {
                this.resTypes.forEach(rt => { if (rt.value == RDFTypesEnum.uri) { this.selectedResType = rt; } });
            } else if (this.value.getValue().isLiteral()) {
                this.resTypes.forEach(rt => { if (rt.value == RDFTypesEnum.literal) { this.selectedResType = rt; } }); 
            }
        }
    }

    onTypeChange() {
        this.value = null;
        this.valueChanged.emit(this.value);
    }

    updateIRI(value: AnnotatedValue<IRI>) {
        this.valueChanged.emit(value);
    }

    updateLiteral(value: AnnotatedValue<Literal>) {
        this.valueChanged.emit(value);
    }

}