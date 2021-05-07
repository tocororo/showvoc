import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SharedModalsServices } from "src/app/modal-dialogs/shared-modals/shared-modal.service";
import { Literal } from "src/app/models/Resources";
import { ResourceUtils } from "src/app/utils/ResourceUtils";
import { Language, Languages } from "../../models/LanguagesCountries";

@Component({
    selector: "lang-string-editor",
    templateUrl: "./langstring-editor.component.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LangStringEditorComponent), multi: true,
    }]
})
export class LangStringEditorComponent implements ControlValueAccessor, OnInit { // based on RdfResourceComponent

    @Input() disabled: boolean = false;
    @Input() lang: Language; //language (can be initially set)
    stringValue: string; // string value of the literal
    
    private literalValue: Literal; // the rdf:langString being edited (the model) 

    public constructor(private sharedModals: SharedModalsServices) {
    }

    ngOnInit(): void {
        this.initLang();
    }

    initLang() {
        if (this.lang == null) {
            this.lang = Languages.getLanguageFromTag(Languages.priorityLangs[0]);
        }
    }

    onStringValueChanged() {
        this.onModelChanged();
    }

    editLanguage() {
        if (this.disabled) return;
        this.sharedModals.selectLanguages({key:"ACTIONS.SELECT_LANGUAGE"}, (this.lang ? [this.lang.tag] : []), true, false).then(
            langs => {
                this.lang = Languages.getLanguageFromTag(langs[0]);
                this.onModelChanged();
            },
            () => { }
        );
    }

    private onModelChanged() {
        let text = this.stringValue ? this.stringValue.trim() : "";
        if (text == "") {
            this.literalValue = null;
        } else {
            this.literalValue = new Literal(text, this.lang.tag);
        }
        this.propagateChange(this.literalValue);
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: Literal | string) {
        if (obj) {
            if (obj instanceof Literal) {
                this.literalValue = obj;
            } else {
                this.literalValue = ResourceUtils.parseLiteral(obj);
            }
        } else {
            this.literalValue = null;
        }

        if (this.literalValue) {
            this.stringValue = this.literalValue.getLabel();
            this.lang = Languages.getLanguageFromTag(this.literalValue.getLanguage());
        } else {
            this.stringValue = null;
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
