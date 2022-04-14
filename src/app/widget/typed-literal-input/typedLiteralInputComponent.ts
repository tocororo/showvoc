import { Component, EventEmitter, forwardRef, Input, Output } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ConstrainingFacets } from 'src/app/models/Datatypes';
import { AnnotatedValue, IRI, Literal } from 'src/app/models/Resources';
import { DatatypesServices } from 'src/app/services/datatypesServices';
import { DatatypeValidator } from 'src/app/utils/DatatypeValidator';
import { RDF, RDFS, XmlSchema } from "../../models/Vocabulary";
import { ResourceUtils, SortAttribute } from "../../utils/ResourceUtils";

@Component({
    selector: "typed-literal-input",
    templateUrl: "./typedLiteralInputComponent.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TypedLiteralInputComponent), multi: true,
    }]
})
export class TypedLiteralInputComponent implements ControlValueAccessor {

    @Input() allowedDatatypes: AnnotatedValue<IRI>[]; //the datatypes allowed by the component
    @Input('datatype') inputDatatype: IRI; //the selected datatype. If provided as input, force the default
    @Output() datatypeChange: EventEmitter<AnnotatedValue<IRI>> = new EventEmitter();
    @Output() langChange: EventEmitter<string> = new EventEmitter();

    datatypeList: AnnotatedValue<IRI>[];
    selectedDatatype: AnnotatedValue<IRI>;

    
    private lang: string; //optional, used only if datatype is xsd:string or rdfs:langString

    private numericInput: boolean = false;
    private numericInputMin: number;
    private numericInputMax: number;

    enumerations: Literal[];
    private selectedEnumeration: Literal;

    private stringValue: string;

    constructor(private datatypeService: DatatypesServices, private dtValidator: DatatypeValidator) { }

    ngOnInit() {
        this.datatypeService.getDatatypes().subscribe(
            datatypes => {
                /**
                 * init datatype list
                 */
                //sort
                ResourceUtils.sortResources(datatypes, SortAttribute.show);
                this.datatypeList = datatypes;
                //filter out not allowed datatypes
                if (this.allowedDatatypes != undefined) {
                    if (this.allowedDatatypes[0].getValue().equals(RDFS.literal)) {
                        //if allowedDatatypes contains only rdfs:Literal => allow every datatype
                    } else { //otherwise filter out
                        for (let i = this.datatypeList.length - 1; i >= 0; i--) {
                            //if datatype is not allowed (not among the allowed) remove it
                            if (!this.allowedDatatypes.some(d => d.getValue().equals(this.datatypeList[i].getValue()))) {
                                this.datatypeList.splice(i, 1);
                            }
                        }
                    }
                }

                /**
                 * Init selected datatype
                 */
                if (this.inputDatatype != null) {
                    this.initDatatype(this.inputDatatype);
                }
                if (this.selectedDatatype == null) { //datatype null (not provided as @Input or the input not found among the available)
                    this.initDatatype(RDF.langString); //set rdf:langString as default if available in the available
                }
                if (this.selectedDatatype == null) { //if still null => set the first
                    this.selectedDatatype = this.datatypeList[0];
                }
                this.onDatatypeChange(false); //trigger the operation after the datatype change (without resetting the value since it could be set as input)
            }
        );
    }

    /**
     * Set the provided datatype as selected in the list. If not found select xml:string as default.
     * If neither xml:string is found, set the first
     * @param datatype 
     */
    private initDatatype(datatype: IRI) {
        let idx = this.datatypeList.findIndex(d => d.getValue().equals(datatype));
        if (idx != -1) { //datatype found in datatype list => select it
            this.selectedDatatype = this.datatypeList[idx];
        }
    }


    /**
     * Returns true if the current datatype doesn't admit all values.
     * (e.g. boolean admits only true and false, time admits values like hh:mm:ss, ...)
     */
    isDatatypeBound(): boolean {
        if (this.selectedDatatype) {
            return (
                this.selectedDatatype.getValue().equals(XmlSchema.boolean) || this.selectedDatatype.getValue().equals(XmlSchema.date) ||
                this.selectedDatatype.getValue().equals(XmlSchema.dateTime) || this.selectedDatatype.getValue().equals(XmlSchema.time)
            );
        } else {
            return false;
        }
    }

    /**
     * 
     * @param keepValue if true, the value is reset after a datatype change
     */
    onDatatypeChange(resetValue: boolean = true) {
        if (resetValue) {
            this.stringValue = null;
        }
        this.updateInputConfiguration();
        this.datatypeChange.emit(this.selectedDatatype);
        this.onValueChanged();
    }

    private updateInputConfiguration() {
        this.numericInput = this.dtValidator.isNumericType(this.selectedDatatype.getValue());
        this.numericInputMin = null;
        this.numericInputMax = null;
        this.enumerations = null;
        
        let facets: ConstrainingFacets = this.dtValidator.getDatatypeFacets(this.selectedDatatype.getValue());
        let enums: Literal[] = this.dtValidator.getDatatypeEnumerations(this.selectedDatatype.getValue());
        if (facets != null) {
            if (this.numericInput) {
                if (facets.maxExclusive != null) {
                    this.numericInputMax = facets.maxExclusive - 1;
                }
                if (facets.maxInclusive != null) {
                    this.numericInputMax = facets.maxInclusive;
                }
                if (facets.minExclusive != null) {
                    this.numericInputMin = facets.minExclusive + 1;
                }
                if (facets.minInclusive != null) {
                    this.numericInputMin = facets.minInclusive;
                }
            }
        } else if (enums != null) { //if enumeration are available
            this.enumerations = enums;
        }
    }

    onLangChanged() {
        this.langChange.emit(this.lang);
        this.onValueChanged();
    }

    onValueChanged() {
        if (this.stringValue == null) {
            this.propagateChange(null);
        } else {
            if (!this.selectedDatatype.getValue().equals(RDF.langString)) {
                this.lang = null;
            }
            this.propagateChange(new Literal(this.stringValue + "", this.lang, this.selectedDatatype.getValue()));
        }
    }

    onEnumerationChange() {
        this.propagateChange(this.selectedEnumeration);
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: Literal) {
        if (obj != null) {
            this.stringValue = obj.getLabel();
            let dt: IRI = obj.getDatatype();
            //select the datatype of the input value (only if datatype list has been initialized)
            if (dt != null && this.datatypeList != null) {
                this.datatypeList.forEach(el => {
                    if (el.getValue().equals(dt)) {
                        this.selectedDatatype = el;
                    }
                });
            }
            this.lang = obj.getLanguage();
        } else {
            this.stringValue = null;
            this.selectedEnumeration = null;
            //the following two lines have been commented in order to avoid to "reset" also the lang or the datatype in case of the bound value is null
            // this.selectedDatatype = null;
            // this.lang = null;
        }
    }
    /**
     * Set the function to be called when the control receives a change event.
     */
    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }
    /**
     * Set the function to be called when the control receives a touch event. Not used.
     */
    registerOnTouched(fn: any): void { }

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: Literal) => { };

    //--------------------------------------------------

}
